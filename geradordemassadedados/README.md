# Gerador de Massa de Dados

Utiliza o jfairy (https://github.com/Codearte/jfairy) para geração de dados de clientes, mais uma mágica caseira pra os valores

Você informa:
- quantos clientes essa massa de dados possuira
- qual a data inicial das transações
- quantas datas você ira gerar (a partir da data inicial)
- qual o volume de transações por segundo
- nome do arquivo de saida (path completo para gravar em outra pasta, ou só o nome para gravar na mesma pasta onde se executa)

##Build local

O projeto foi criado usando Eclipse Luna e Gradlew

Para trazer as dependencias (as outras bibliotecas) você entra no diretório do projeto e executa:

gradlew.bat build

isso vai trazer as dependencias dos repositórios, compilar o projeto, e o eclipse não vai reclamar de que está faltando dependencias :)

se mesmo assim não funcionar, você executa essas duas tasks do gradlew:

gradlew.bat cleanEclipse
gradlew.bat eclipse

e depois de novo 

gradlew.bat build

para saber mais sobre esse esquema do gradlew visite: https://gradle.org/
