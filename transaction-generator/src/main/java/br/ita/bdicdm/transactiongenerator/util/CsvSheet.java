package br.ita.bdicdm.transactiongenerator.util;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import br.ita.bdicdm.transactiongenerator.util.CsvSheet.CsvRow;

/**
 * Class that represents a Csv sheet.
 * 
 * It uses a ArrayList for storing the rows and hash maps for
 * storing the columns. 
 * 
 *  The general procedure is to call getRow to get a given row *  
 *  and, then, ask by the column label.
 *   
 *  
 * 
 *
 */
public class CsvSheet implements Iterable<CsvRow> {

	private List<CsvRow> sheet = new ArrayList<>();
	private String[] labels = new String[0];
	
	public CsvSheet(String... labels) {
		this.labels = labels;
	}
	
	/**
	 * Add a new row to this sheet.
	 * @param row the row to be added
	 * @return the sheet object for cascading operations.
	 */
	public CsvSheet addRow(CsvRow row) {
		sheet.add(row);
		return this;
	}
	
	/**
	 * Get a given row through its index.
	 * 
	 * @param rowNumber the number of the row, starting at 0.
	 * @return the corresponding csv row.
	 * @throws ArrayIndexOutOfBoundsException if this CSV sheet
	 * does not have a row with the provided row index.
	 */
	public CsvRow getRow(int rowNumber) {
		if (rowNumber < 0 || rowNumber >= sheet.size()) {
			throw new ArrayIndexOutOfBoundsException(rowNumber);
		}
		return sheet.get(rowNumber);
	}
	
	public int getNumberOfRows() {
		return this.sheet.size();
	}
	
	/**
	 * Return the column labels on the order in which they
	 * appear on the document.
	 * 
	 * @return the columns labels.
	 */
	public String[] getLabels() {
		return labels;
	}
		
	/**
	 * Class which represents a row in a CSV Sheet.
	 * It stores all the columns values for that row.
	 * 
	 *
	 */
	public static class CsvRow {
		private HashMap<String, String> columns = new HashMap<>();
		private final int index;
		
		public CsvRow(int index) {
			this.index = index;
		}
		
		public CsvRow setColumn(String columnName, String value) {
			columns.put(columnName, value);
			return this;
		}
		
		public String getColumn(String columnName) {
			return columns.get(columnName);
		}
		
		public int getIndex() {
			return index;
		}
	}

	@Override
	public Iterator<CsvRow> iterator() {
		return sheet.iterator();
	}
}
