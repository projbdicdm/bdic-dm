package br.ita.bdicdm.transactiongenerator.control;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import javax.swing.JOptionPane;

import br.ita.bdicdm.transactiongenerator.model.User;

import com.datastax.driver.core.BoundStatement;
import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.PreparedStatement;
import com.datastax.driver.core.Row;
import com.datastax.driver.core.Session;
import com.mysql.jdbc.jdbc2.optional.MysqlDataSource;

public class UserDAO {

	private static final String DB_URL ="jdbc:mysql://orion2412.startdedicated.net/BDIC-DM";
	private static final String USER = "root";
	private static final String PASS = "12root34";
	
	private static final String ITA_SERVER = "orion2412.startdedicated.net";
	private static final String LOCAL_SERVER = "192.168.56.101";
	private Cluster cluster;
	private Session session;
	private PreparedStatement selectCassandraUser;
	private PreparedStatement findCassandraUser;
	private UserFactory userFactory;
	
	private static UserDAO instance = new UserDAO();
	
	public static UserDAO getInstance() {
		return instance;
	}
	
	private UserDAO() {
		try {
			String server = ITA_SERVER;
			cluster = Cluster.builder()
					.addContactPoint(server).build();
			session = cluster.connect("\"BDICDM\"");
			initStatements();
		} catch (Exception e) {
			if (session != null && !session.isClosed()) {
				session.close();
			}
			if (cluster != null && !cluster.isClosed()) {
				cluster.close();
			}
			JOptionPane.showMessageDialog(null, 
					"Error when connecting to Cassandra server. Exiting...", 
					"Fatal Error", JOptionPane.ERROR_MESSAGE);
			System.exit(1);
		} 
	} 

	private void initStatements() {
		selectCassandraUser = session.prepare("SELECT usr_login, usr_token from \"USER\"");
		findCassandraUser = session.prepare("SELECT * from \"USER\" where usr_login = ?");
	}

	public List<String> listUserLogins() {
		String sql = "Select usr_login, usr_token from user limit 100";
		List<String> result = new ArrayList<>();
		Connection conn = null;
		Statement stmt = null;
		try{
			Class.forName("com.mysql.jdbc.Driver");

			System.out.println("Connecting to database...");
			MysqlDataSource dataSource = new MysqlDataSource();
			dataSource.setUrl(DB_URL);
			dataSource.setUser(USER);
			dataSource.setPassword(PASS);
			conn = dataSource.getConnection();

			System.out.println("Creating statement...");
			stmt = conn.createStatement();
			ResultSet rs = stmt.executeQuery(sql);

			while(rs.next()){
				String login = rs.getString("usr_login");
				result.add(login);
			}
			rs.close();
			stmt.close();
			conn.close();
		}catch(SQLException se){
			se.printStackTrace();
		}catch(Exception e){
			e.printStackTrace();
		}finally{
			try{
				if(stmt!=null)
					stmt.close();
			}catch(SQLException se2){
			}
			try{
				if(conn!=null)
					conn.close();
			}catch(SQLException se){
				se.printStackTrace();
			}
		}
		return result;
	}
	
	public List<String> listUserCassandra() {
		
		List<String> users = new ArrayList<String>();
		
		BoundStatement statement = selectCassandraUser.bind();
		com.datastax.driver.core.ResultSet resultSet = session.execute(statement);
		for (Row row : resultSet) {
			String usrToken = row.getString("usr_token");
			if (usrToken != null && !usrToken.equals("")) {
				users.add(row.getString("usr_login"));
			}
		}
			
		return users;

	}

	public User find(String userLogin) {
		BoundStatement statement = findCassandraUser.bind(userLogin);
		com.datastax.driver.core.ResultSet resultSet = session.execute(statement);
		Row userRow = null;
		User user = null;
		for (Row row : resultSet) {
			String usrToken = row.getString("usr_token");
			if (usrToken != null && !usrToken.equals("")) {
				userRow = row;
				break;
			}
		}
		if (userRow != null) {
			userFactory = new UserFactory();
			user = userFactory.create(userRow);			
		}
		return user;
	}

}
