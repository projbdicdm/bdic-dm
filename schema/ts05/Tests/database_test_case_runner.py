#!/usr/bin/env python
# -*- coding: utf-8 -*-

import MySQLdb 
import csv, sys, codecs

reload(sys)
sys.setdefaultencoding("utf-8")

def read_test_case_from_file(csv_file_path):
    with codecs.open(csv_file_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile, delimiter=';', quotechar='"', skipinitialspace=True, quoting = csv.QUOTE_MINIMAL)
        steps = []
        headers = next(reader, None)
        for row in reader:
            step = dict(zip(headers, row))
            steps.append(step)

        return steps

def run_steps(test_case_steps):
    conn = MySQLdb.connect(host, user, passw, database) 
    cursor = None
    try:
        counter = 1
        for step in test_case_steps:
            step_description = step['description'].strip()
            command_changer = step['commandChanger'].strip()
            command_verifier = step['commandVerifier'].strip()
            expected_result = step['expectedResult'].strip()
            counter += 1
            print "...Rodando linha",counter,"- '",step_description,"'"

            cursor = conn.cursor () 

            #Running command under test
            if  command_changer != None and command_changer.strip() != '':        
                try:                    
                    cursor.execute (command_changer)
                except Exception as e:
                    print "......FALHOU ao executar comando '",command_changer,"' - ", e
                    continue

            if command_verifier.strip() == "" or expected_result.strip() == "":
                raise Exception("Fatal error on line",counter+1,"! It is necessary the fields commandVerifier and expectedResult")

            ## Running verifier command
            try:
                cursor.execute (command_verifier)
                result_row = cursor.fetchone()

                if result_row != None and str(result_row[0]) == str(expected_result):
                    print "......PASSOU"
                else:
                    print "......FALHOU - Esperado:",expected_result," | Obtido:", (str(result_row[0]) if result_row != None else "None")
            except Exception as e:
                print "......FALHOU ao executar comando '",command_verifier,"' - ", e                     
    finally:
        #Do not persists changes on DB
        conn.rollback () 
        if cursor != None:
            cursor.close () 
        conn.close ()

if __name__ == "__main__":
    host = sys.argv[1]
    user = sys.argv[2]
    passw = sys.argv[3]
    database = sys.argv[4]
    csv_file_path = sys.argv[5]


    print "\n================ RUNNING TEST CASE",csv_file_path,"================"

    print "Reading test case CSV..."
    test_case_steps = read_test_case_from_file(csv_file_path)
    print "Running test cases..."
    run_steps(test_case_steps)


'''
Command line example:
python database_test_case_runner.py db4free.net benutzertest bdicdm2015! bdicdm "test_case_table_cartao.csv"
'''

    



    