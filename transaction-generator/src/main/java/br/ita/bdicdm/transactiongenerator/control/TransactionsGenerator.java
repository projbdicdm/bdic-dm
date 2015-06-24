package br.ita.bdicdm.transactiongenerator.control;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import br.ita.bdicdm.transactiongenerator.model.Transaction;
import br.ita.bdicdm.transactiongenerator.model.User;

import com.datastax.driver.core.BoundStatement;
import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.PreparedStatement;
import com.datastax.driver.core.Session;

public class TransactionsGenerator {

	private static final String ITA_SERVER = "orion2412.startdedicated.net";
	private static final String LOCAL_SERVER = "192.168.56.101";
	
	private static String folderName = null;
	private static PreparedStatement insertUser;

	public static void main(String[] args) {
		String server = null;
		
		if (args.length == 2) {
			folderName = args[0];
			server = args[1];
		} else {
			folderName = System.getProperty("user.home")+"/bdicdm/";
			server = ITA_SERVER;
		}
		File folder = new File(folderName);
		folder.mkdirs();
		
		int numberOfTransactions = 100;
		double[] creditLimit = new double[]{1000.0, 4000.0, 6000.0}; 
			
		try (Cluster cluster = Cluster.builder()
				.addContactPoint(server).build();
				Session session = cluster.connect("\"BDICDM\"");){
			insertUser = session.prepare("INSERT INTO \"USER\" (usr_login, usr_name, usr_password, usr_token, usr_type) VALUES (?, ?, ?, ?, ?)");
			for (int i=0; i<3; i++) {
				createUserAndTransactions(session, numberOfTransactions, creditLimit[i], TransactionFactory.LOW_TRANSACTIONS_VALUES);
				createUserAndTransactions(session, numberOfTransactions, creditLimit[i], TransactionFactory.MEDIUM_TRANSACTIONS_VALUES);
				createUserAndTransactions(session, numberOfTransactions, creditLimit[i], TransactionFactory.HIGH_TRANSACTIONS_VALUES);
			}
			
		}
	}

	private static void createUserAndTransactions(Session session, int numberOfTransactions,
			double creditLimit, String mostTransactionsValue) {
		UserFactory uf = new UserFactory();
		User user = uf.create();

		TransactionFactory tf = new TransactionFactory(user);
		List<Transaction> transactions = tf.create(numberOfTransactions, mostTransactionsValue, creditLimit);
		
		try(PrintWriter writer = new PrintWriter(folderName+user.getUsrLogin()+".csv")) {
			BoundStatement bs = insertUser.bind(user.getUsrLogin(), user.getUsrName(),
					user.getUsrPassword(), user.getUsrToken(), user.getUsrType());
			session.execute(bs);
			writer.println(Transaction.csvHeader());
			for (Transaction transaction : transactions) {
				writer.println(transaction.toCsv());
			}
			writer.flush();
		} catch (IOException e) {
			throw new RuntimeException ("Error when writing csv file.", e);
		}
	}
}
