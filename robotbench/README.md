TS02 - RobotBench
=====

Robô para geração de Dados para fraude e métrica de arquitetura

Instruções para uso local:

- Baixar [XAMPP][xampp] e efetuar a instalação do servidor web local.
- Configurar arquivo lib/appconfig.php com a url de seu servidor local.
- Checar conexão ao Cassandra no arquivo lib/RobotBench/connection.php
- Subir a VM ITA e ativar o serviço Cassandra.
- Abir o Datastax Dev Center e executar o script schema/tablesRobotBench.sql
- Ativar o Servidor Apache em seu painel [XAMPP][xampp] e acessar via navegador.


Contribuições feitas pela comunidade GitHub para criação do sistema:

- Faker: https://github.com/bobthecow/Faker
- PHP Benchmark: https://github.com/victorjonsson/PHP-Benchmark
- PHP Cassandra: https://github.com/duoshuo/php-cassandra

Yeah!

 [xampp]: https://www.apachefriends.org/pt_br/index.html
