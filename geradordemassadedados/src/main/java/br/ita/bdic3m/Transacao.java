package br.ita.bdic3m;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import org.jfairy.producer.person.Person;
import org.postgresql.jdbc2.optional.SimpleDataSource;

/**
 * 
 * Representa uma transação, o cliente é uma classe @see{org.jfairy.producer.person.Person} do jfairy
 * 
 * @author André Lamas
 * 
 */
public class Transacao {

	private int id;
	private Date dataTransacao;
	private double valor;
	private Person cliente;


	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public Date getDataTransacao() {
		return dataTransacao;
	}

	public void setDataTransacao(Date dataTransacao) {
		this.dataTransacao = dataTransacao;
	}

	public double getValor() {
		return valor;
	}

	public void setValor(double valor) {
		this.valor = valor;
	}

	public Person getCliente() {
		return cliente;
	}

	public void setCliente(Person cliente) {
		this.cliente = cliente;
	}

	@Override
	public String toString() {
		return "Transacao [nome=" + cliente.fullName() + ", email="
				+ cliente.email() + "CPF="
				+ cliente.nationalIdentificationNumber() + ", dataTransacao="
				+ dataTransacao + ", valor=" + valor + "]";
	}
	
	static StringBuffer sb = new StringBuffer();
	static SimpleDateFormat inFormat = new SimpleDateFormat(
			"dd-MMM-yyyy' 'HH:mm:ss", Locale.US);
	
	public String toString(String separetor) {
		
		sb.setLength(0);
		
		sb.append(getId());
		sb.append(separetor);
		sb.append(inFormat.format(getDataTransacao()));
		sb.append(separetor);
		sb.append(getCliente().fullName());
		sb.append(separetor);
		sb.append(getCliente().nationalIdentificationNumber());
		sb.append(separetor);
		sb.append(getCliente().companyEmail());
		sb.append(separetor);
		sb.append(getValor());

		return sb.toString();
	}

}
