#!/bin/bash

ENVIRON='.venv/bin/activate'

PATH_TEST_ROOT='__tests__'

source $ENVIRON

cd $PATH_TEST_ROOT/models/config

python3 test_config.py
if test $? -ne 0; then 
    echo "Erro no test_config.py";
    exit 127;
fi

python3 test_config_data.py
if test $? -ne 0; then 
    echo "Erro no test_config_data.py";
    exit 127;
fi

python3 test_config_db.py
if test $? -ne 0; then 
    echo "Erro no test_config_db.py";
    exit 127;
fi

cd - 
cd $PATH_TEST_ROOT/models/sector

python3 test_sector.py
if test $? -ne 0; then 
    echo "Erro no test_sector.py"; 
    exit 127;
fi

python3 test_sector_db.py
if test $? -ne 0; then 
    echo "Erro no test_sector_db.py"; 
    exit 127;
fi

cd - 
cd $PATH_TEST_ROOT/models/user

python3 test_user.py
if test $? -ne 0; then 
    echo "Erro no test_user.py"; 
    exit 127;
fi

python3 test_user_db.py
if test $? -ne 0; then 
    echo "Erro no test_user_db.py"; 
    exit 127;
fi

python3 test_user_auth.py
if test $? -ne 0; then 
    echo "Erro no test_user_auth.py"; 
    exit 127;
fi