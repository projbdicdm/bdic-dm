package br.ita.bdicdm.transactiongenerator.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import br.ita.bdicdm.transactiongenerator.util.CsvSheet.CsvRow;

/**
 * Utility class for reading CSV files.
 * 
 * The CSV must follow a pattern to be read by this reader.
 * 
 * The first row shall contain the columns labels.
 * The remaining rows shall contain the data. 
 *
 * 
 * Example of a valid CSV:
 * 
 * Id;Name;Address
 * 1;Bart Simpson;Springfield,MO,US
 * 2;Homer Simpson;Springfield,MO,US
 * 
 *
 */
public class CsvReader {

	private char separator = ';';
	
	public CsvReader() {}
	
	public CsvReader(char separator) {
		this.separator = separator;
	}
	
	/**
	 * Read a CSV file referenced by the provided input stream.
	 * @param input the input stream referencing a csv file.
	 * @return the complete CSV sheet.
	 */
	public CsvSheet read(InputStream input) {
		try {
			// Create the buffered reader from the input stream.
			final BufferedReader reader = new BufferedReader(new InputStreamReader(input));
			// extract the labels from the first line of the sheet. 
			String line = reader.readLine();
			String[] labels = extractLabels(line);
			// Create the in-memory sheet with the columns labels
			final CsvSheet sheet = new CsvSheet(labels);
			// read the remaining lines
			line = reader.readLine();
			while (line != null) {
				// add a new row 
				CsvRow row = extractRow(sheet, labels, line);
				sheet.addRow(row);
				// step to the next line on the csv file
				line = reader.readLine();
			}
			return sheet;
		} catch (IOException e) {
			throw new RuntimeException("Error on the read of the csv file", e);
		}
	}

	/**
	 * Extract a row from a CSV document.
	 * @param sheet the CSV sheet being collected.
	 * @param labels the columns labels.
	 * @param line the current line being read.
	 * @return the CSV row read.
	 */
	private CsvRow extractRow(CsvSheet sheet, String[] labels, String line) {
		CsvRow row = new CsvRow(sheet.getNumberOfRows() + 1);
		String[] columns = line.split(String.valueOf(this.separator));
		for (int i = 0; i < columns.length; i++) {
			row.setColumn(labels[i], columns[i].trim());
		}
		return row;
	}

	/**
	 * Extract the labels from the provided csv line.
	 * @param line the csv line containing the labels.
	 * @return a string array containing the column labels in 
	 * the order in which they appear on the document.
	 */
	private String[] extractLabels(String line) {
		String[] labels = line.split(String.valueOf(this.separator));
		for (int i = 0; i < labels.length; i++) {
			labels[i] = labels[i].trim();
		}
		return labels;
	}
	
}
