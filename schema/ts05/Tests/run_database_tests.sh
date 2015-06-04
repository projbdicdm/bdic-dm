#!/bin/bash -v

# Any subsequent commands which fail will cause the shell script to exit immediately
set -e


host="db4free.net" 
user="benutzertest" 
passw="bdicdm2015!"  
database="bdicdm" 

echo "RUNNING ALL TEST CASES"

python -u database_test_case_runner.py ${host} ${user} ${passw} ${database} "test_case_table_cartao.csv"
python -u database_test_case_runner.py ${host} ${user} ${passw} ${database} "test_case_table_categoria.csv"
python -u database_test_case_runner.py ${host} ${user} ${passw} ${database} "test_case_table_cidade.csv"
python -u database_test_case_runner.py ${host} ${user} ${passw} ${database} "test_case_table_cliente.csv"
python -u database_test_case_runner.py ${host} ${user} ${passw} ${database} "test_case_table_estado.csv"
python -u database_test_case_runner.py ${host} ${user} ${passw} ${database} "test_case_table_fone.csv"
python -u database_test_case_runner.py ${host} ${user} ${passw} ${database} "test_case_table_hist_preco.csv"
python -u database_test_case_runner.py ${host} ${user} ${passw} ${database} "test_case_table_localidade.csv"
python -u database_test_case_runner.py ${host} ${user} ${passw} ${database} "test_case_table_localidade_tipo.csv"
python -u database_test_case_runner.py ${host} ${user} ${passw} ${database} "test_case_table_pais.csv"
python -u database_test_case_runner.py ${host} ${user} ${passw} ${database} "test_case_table_produto.csv"
python -u database_test_case_runner.py ${host} ${user} ${passw} ${database} "test_case_table_status.csv"
python -u database_test_case_runner.py ${host} ${user} ${passw} ${database} "test_case_table_user.csv"

echo "ALL TEST CASES WERE RUN SUCESSFULLY"