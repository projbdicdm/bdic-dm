package br.ita.bdicdm.transactiongenerator.model;

public class User {
	private String usrLogin;
	private String usrName;
	private String usrPassword;
	private String usrToken;
	private String usrType;
	
	public String getUsrLogin() {
		return usrLogin;
	}
	
	public void setUsrLogin(String usrLogin) {
		this.usrLogin = usrLogin;
	}
	
	public String getUsrName() {
		return usrName;
	}
	
	public void setUsrName(String usrName) {
		this.usrName = usrName;
	}
	
	public String getUsrPassword() {
		return usrPassword;
	}
	
	public void setUsrPassword(String usrPassword) {
		this.usrPassword = usrPassword;
	}
	
	public String getUsrToken() {
		return usrToken;
	}
	
	public void setUsrToken(String usrToken) {
		this.usrToken = usrToken;
	}
	
	public String getUsrType() {
		return usrType;
	}
	
	public void setUsrType(String usrType) {
		this.usrType = usrType;
	}

	@Override
	public String toString() {
		return "User [usrLogin=" + usrLogin + ", usrName=" + usrName
				+ ", usrPassword=" + usrPassword + ", usrToken=" + usrToken
				+ ", usrType=" + usrType + "]";
	}
	
	
}
