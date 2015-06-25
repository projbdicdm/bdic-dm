package br.ita.bdicdm.transactiongenerator.control;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;
import java.util.Random;
import java.util.UUID;

import com.datastax.driver.core.Row;

import br.ita.bdicdm.transactiongenerator.model.User;

public class UserFactory {
	
	//private static final List<String> firstNames;
	//private static final List<String> surnames;
	private static final List<String> mySQLNames;
	private static final List<String> mySQLEmails;
	private Random random;
	
	static {
		try(InputStream is = UserFactory.class.getResourceAsStream("/names.properties")) {
			Properties properties = new Properties();
			properties.load(new InputStreamReader(is, Charset.forName("UTF-8")));
			//firstNames = Arrays.asList(((String)properties.get("first.male.names")).split(","));
			//surnames = Arrays.asList(((String)properties.get("surnames")).split(","));
			mySQLNames = Arrays.asList(((String)properties.get("mysql.names")).split(","));
			mySQLEmails = Arrays.asList(((String)properties.get("mysql.emails")).split(","));
		} catch (IOException e) {
			throw new RuntimeException("Error when reading the names file.", e);
		}
		
	}
	
	public UserFactory() {
		random = new Random();
	}

	public User create() {
		//String firstName = firstNames.get(random.nextInt(firstNames.size()));
		//String surname = surnames.get(random.nextInt(surnames.size()));
		int randomNumber = random.nextInt(mySQLNames.size());
		String name = mySQLNames.get(randomNumber);
		String email = mySQLEmails.get(randomNumber);
		User user = new User();
		user.setUsrName(name.replace(" ", "").toLowerCase());
		//String login = firstName.charAt(0)+surname+"@email.com.br";
		//login = login.toLowerCase();
		user.setUsrLogin(email);
		user.setUsrPassword(user.getUsrLogin());
		user.setUsrToken(UUID.randomUUID().toString());
		user.setUsrType("client");
		return user;
	}

	public User create(Row row) {
		User user = new User();
		user.setUsrLogin(row.getString("usr_login"));
		user.setUsrName(row.getString("usr_name"));
		user.setUsrPassword(row.getString("usr_password"));
		user.setUsrToken(row.getString("usr_token"));
		user.setUsrType(row.getString("usr_type"));
		return user;
	}
	
	
	
}
