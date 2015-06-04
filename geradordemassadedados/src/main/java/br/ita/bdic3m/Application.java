package br.ita.bdic3m;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.DriverManager;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.Locale;
import java.util.Random;
import java.util.Set;

import org.jfairy.Fairy;
import org.jfairy.producer.person.Person;
import org.joda.time.DateTime;
import org.apache.commons.lang3.time.StopWatch;


/**
 * 
 * @author André Lamas
 *
 */
public class Application {

	
	/**
	 * Robo gerador de massa de dados
	 * 
	 * Você informa:
	 * 
	 * - quantos clientes essa massa de dados possuira
	 * - qual a data inicial das transações
	 * - quantas datas você ira gerar (a partir da data inicial)
	 * - qual o volume de transações por segundo
	 * - nome do arquivo de saida (path completo para gravar em outra pasta, ou só o nome para gravar na mesma pasta onde se executa)
	 * 
	 * @param args
	 */
	public static void main(String[] args) {

		if (args.length != 5) {
			System.out
					.println("java gerador.class [qtd de clientes] [data inicial: dd-mm-aaaa] [quantidade de datas] [Transações por Segundo] [nome do arquivo de saida]");
			return;
		}
		int quantidadeDeClientes;
		Date dataInicial;
		SimpleDateFormat formatter;
		int quantidadeDeDatas;
		int transacoesPorSegundo;
		String nomeDoArquivoDeSaida = "";

		// lendo os parametros de entrada do robô
		quantidadeDeClientes = Integer.parseInt(args[0]);
		formatter = new SimpleDateFormat("dd-MM-yyyy");
		try {
			dataInicial = formatter.parse(args[1]);
		} catch (ParseException e) {
			System.out
					.println("Erro ao parsear a data inicial. Verifique o formato: dd-MM-yyyy");
			e.printStackTrace();
			return;
		}

		quantidadeDeDatas = Integer.parseInt(args[2]);
		transacoesPorSegundo = Integer.parseInt(args[3]);
		nomeDoArquivoDeSaida = args[4];

		// agora fazemos algumas contas para construir as transações
		int totalTransacoes = quantidadeDeDatas
				* (transacoesPorSegundo * 60 * 60 * 24);

		Fairy f = Fairy.create(Locale.UK);
		Transacao t;
		Person p;
		Calendar c = Calendar.getInstance();
		c.setTime(dataInicial);

		// criamos um ArrayList para armazenar os clientes
		ArrayList<Person> pessoas = new ArrayList<Person>(quantidadeDeClientes);

		for (int i = 0; i < quantidadeDeClientes; i++) {
			pessoas.add(f.person());
		}

		// Por fim geramos a massa :)
		Random r = new Random();
		int posicao = r.nextInt(quantidadeDeClientes);
		c.setTime(dataInicial);

		try {
			PrintWriter out = new PrintWriter(new BufferedWriter(
					new FileWriter(nomeDoArquivoDeSaida, true)));
			out.println("Id;Date;FullName;NationalIdentificationNumber;CompanyEmail;Valor");
			int id = 1;

			for (int dia = 0; dia < quantidadeDeDatas; dia++) {
				c.add(Calendar.DATE, dia);
				for (int hora = 0; hora < 24; hora++) {
					c.add(Calendar.HOUR_OF_DAY, hora);
					for (int minuto = 0; minuto < 60; minuto++) {
						c.add(Calendar.MINUTE, minuto);
						for (int segundo = 0; segundo < 60; segundo++) {
							c.add(Calendar.SECOND, segundo);
							for (int tps = 0; tps < transacoesPorSegundo; tps++) {
								t = new Transacao();
								t.setCliente(pessoas.get(posicao));
								t.setDataTransacao(c.getTime());
								t.setValor(r.nextDouble() * r.nextInt(5000)
										+ r.nextDouble() * 0.10);
								t.setId(id++);
								// grava a linha no arquivo
								out.println(t.toString(";"));

								// pegamos o proximo cliente para a proxima
								// linha
								posicao = r.nextInt(quantidadeDeClientes);
							}
						}
					}
				}

			}

			// fechamos o arquivo
			out.flush();
			out.close();
		} catch (Exception e) {
			e.printStackTrace();
		}

	}

}
