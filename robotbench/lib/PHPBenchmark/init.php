<?php

if( isset($_REQUEST['php-benchmark-test']) ) {
    require __DIR__.'/lib/PHPBenchmark/Monitor.php';
    \PHPBenchmark\Monitor::instance()->init( !empty($_REQUEST['display-data']) );
}
