package br.ita.bdicdm.transactiongenerator.model;

import java.text.SimpleDateFormat;
import java.util.Date;

public class Transaction {
	private String usrToken;
	private String traId;
	private int carId;
	private int locId;
	private String traConfirmationcode;
	private Date traDate;
	private float traLat;
	private float traLon;
	private String traSegment;
	private String traStatus;
	private double traValue;
	
	private static SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
	
	public String getUsrToken() {
		return usrToken;
	}
	
	public void setUsrToken(String usrToken) {
		this.usrToken = usrToken;
	}
	
	public String getTraId() {
		return traId;
	}
	
	public void setTraId(String traId) {
		this.traId = traId;
	}
	
	public int getCarId() {
		return carId;
	}
	
	public void setCarId(int carId) {
		this.carId = carId;
	}
	
	public int getLocId() {
		return locId;
	}
	
	public void setLocId(int locId) {
		this.locId = locId;
	}
	
	public String getTraConfirmationcode() {
		return traConfirmationcode;
	}
	
	public void setTraConfirmationcode(String traConfirmationcode) {
		this.traConfirmationcode = traConfirmationcode;
	}
	
	public Date getTraDate() {
		return traDate;
	}
	
	public void setTraDate(Date traDate) {
		this.traDate = traDate;
	}
	
	public float getTraLat() {
		return traLat;
	}
	
	public void setTraLat(float traLat) {
		this.traLat = traLat;
	}
	
	public float getTraLon() {
		return traLon;
	}
	
	public void setTraLon(float traLon) {
		this.traLon = traLon;
	}
	
	public String getTraSegment() {
		return traSegment;
	}
	
	public void setTraSegment(String traSegment) {
		this.traSegment = traSegment;
	}
	
	public String getTraStatus() {
		return traStatus;
	}
	
	public void setTraStatus(String traStatus) {
		this.traStatus = traStatus;
	}
	
	public double getTraValue() {
		return traValue;
	}
	
	public void setTraValue(double traValue) {
		this.traValue = traValue;
	}
	
	public static String csvHeader () {
		StringBuilder sb = new StringBuilder();
		String separator = ",";
		sb.append("usr_token").append(separator)
		  .append("tra_id").append(separator)
		  .append("car_id").append(separator)
		  .append("loc_id").append(separator)
		  .append("tra_confirmationcode").append(separator)
		  .append("tra_date").append(separator)
		  .append("tra_lat").append(separator)
		  .append("tra_lon").append(separator)
		  .append("tra_segment").append(separator)
		  .append("tra_status").append(separator)
		  .append("tra_value");
		return sb.toString();
	}
	
	public String toCsv() {
		StringBuilder sb = new StringBuilder();
		String separator = ",";
		sb.append(usrToken).append(separator)
		  .append(traId).append(separator)
		  .append(carId).append(separator)
		  .append(locId).append(separator)
		  .append(traConfirmationcode).append(separator)
		  .append(dateFormat.format(traDate)).append(separator)
		  .append(traLat).append(separator)
		  .append(traLon).append(separator)
		  .append(traSegment).append(separator)
		  .append(traStatus).append(separator)
		  .append(traValue);
		return sb.toString();

	}

	@Override
	public String toString() {
		return "Transaction [usrToken=" + usrToken + ", traId=" + traId
				+ ", carId=" + carId + ", locId=" + locId
				+ ", traConfirmationcode=" + traConfirmationcode + ", traDate="
				+ traDate + ", traLat=" + traLat + ", traLon=" + traLon
				+ ", traSegment=" + traSegment + ", traStatus=" + traStatus
				+ ", traValue=" + traValue + "]";
	}
	
	
}
