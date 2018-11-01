<?php  

// Expect to get a color
$sColor = $_GET['letter']; // blue, green, purple, yellow
file_put_contents("letters.txt", $sColor, FILE_APPEND);


?>