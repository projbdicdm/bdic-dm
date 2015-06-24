package br.ita.bdicdm.transactiongenerator;

import static org.junit.Assert.*;

import java.util.List;

import org.junit.Test;

import br.ita.bdicdm.transactiongenerator.control.TransactionFactory;
import br.ita.bdicdm.transactiongenerator.model.Transaction;
import br.ita.bdicdm.transactiongenerator.model.User;

public class TransactionFactoryTest {

	@Test
	public void test() {
		User user = new User();
		user.setUsrToken("12345");
		TransactionFactory factory = new TransactionFactory(user);
		List<Transaction> result = factory.create(100, "LOW", 10000);
		assertEquals(100, result.size());
		
		int[] count = new int[3];
		for (Transaction transaction : result) {
			double value = transaction.getTraValue();
			
			if (value < 10000/3) {
				count[0] +=1;
			} else if (value < 10000*2/3) {
				count[1] +=1;
			} else {
				count[2] +=1;
			}
		}
		assertEquals(80, count[0]);
		assertEquals(10, count[1]);
		assertEquals(10, count[2]);
	}

}
