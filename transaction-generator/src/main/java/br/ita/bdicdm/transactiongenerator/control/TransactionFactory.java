package br.ita.bdicdm.transactiongenerator.control;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Random;
import java.util.UUID;

import br.ita.bdicdm.transactiongenerator.model.Transaction;
import br.ita.bdicdm.transactiongenerator.model.User;

public class TransactionFactory {

	public static final String HIGH_TRANSACTIONS_VALUES = "HIGH";
	public static final String MEDIUM_TRANSACTIONS_VALUES = "MEDIUM";
	public static final String LOW_TRANSACTIONS_VALUES = "LOW";
	
	private User user;
	private Random random;

	public TransactionFactory(User user) {
		this.user = user;
		this.random = new Random();
	}

	public List<Transaction> create(int numberOfTransactions, String value,
			double creditLimit) {
		List<Double> values = generateTransactionsValues(numberOfTransactions,
				value, creditLimit);
		List<Transaction> transactions = new ArrayList<>();
		double monthLimit = 0.0;
		Calendar currentDate = Calendar.getInstance();
		for (int i = 0; i < numberOfTransactions; i++) {
			Transaction transaction = new Transaction();
			transaction.setUsrToken(user.getUsrToken());
			transaction.setTraId(UUID.randomUUID().toString());
			transaction.setCarId(-1);
			transaction.setLocId(-1);
			transaction.setTraConfirmationcode("00000");
			
			if(monthLimit+values.get(i) > creditLimit) {
				monthLimit = 0.0;
				currentDate.add(Calendar.MONTH, -1);
			}
			
			Date transactionTime = getRandomDateInMonth(currentDate);
			
			transaction.setTraDate(transactionTime);
			transaction.setTraLat(-1f);
			transaction.setTraLon(-1f);
			transaction.setTraSegment("E-COMMERCE-VAREJO");
			transaction.setTraStatus("PENDING");
			transaction.setTraValue(values.get(i));

			monthLimit+= transaction.getTraValue();
			transactions.add(transaction);
		}
		return transactions;
	}

	private Date getRandomDateInMonth(Calendar currentDate) {
		Calendar calendar = Calendar.getInstance();
		calendar.setTimeInMillis(currentDate.getTimeInMillis());
		calendar.set(Calendar.DAY_OF_MONTH, random.nextInt(28)+1);
		calendar.set(Calendar.HOUR_OF_DAY, random.nextInt(24));
		calendar.set(Calendar.MINUTE, random.nextInt(60));
		return calendar.getTime();
	}

	private List<Double> generateTransactionsValues(int numberOfTransactions,
			String value, double creditLimit) {
		int tenPercentTransactions = (int) (numberOfTransactions*0.1);
		int eightyPercentTransactions = numberOfTransactions- (tenPercentTransactions*2);
		List<Integer> distribution = null;
		switch (value) {
		case LOW_TRANSACTIONS_VALUES:
			distribution = Arrays.asList(eightyPercentTransactions, tenPercentTransactions, tenPercentTransactions);
			break;
		case MEDIUM_TRANSACTIONS_VALUES:
			distribution = Arrays.asList(tenPercentTransactions, eightyPercentTransactions, tenPercentTransactions);
			break;
		case HIGH_TRANSACTIONS_VALUES:
			distribution = Arrays.asList(tenPercentTransactions, tenPercentTransactions, eightyPercentTransactions);
			break;		
		}
		
		List<Double> values = new ArrayList<Double>();
		Random random = new Random();
		double expense = 0.0;
		
		for (int i=0; i< distribution.size(); i++) {
			int occurences = distribution.get(i);
			for (int j=0; j< occurences; j++) {
				expense = (creditLimit * i / 3)   + creditLimit
						* random.nextDouble()/3;
				expense = Math.round(expense * 100) / 100;
				values.add(expense);
			}
			
		}
		Collections.shuffle(values);
		return values;
	}
}
