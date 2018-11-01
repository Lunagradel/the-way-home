<!DOCTYPE html>

<html>
<head>
    <title>TheWayHome</title>
    <script src="js/createjs-2015.05.21.min.js"></script>
    <style>
        canvas {
            background-color: #2d3a3a;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
        body {
            background-color: #636363;
        }
        a {
            display: inline-block;
            color: #2b2b2b;
            text-decoration: none;
            font-size: 3vh;
            font-family: 'Helvetica';
            position: relative;
            left: 32vw;
            width: 15vw;
            padding: 3vh;
        }
    </style>
</head>

<body onload="init()">
<canvas id ="gameCanvas" width="1000" height="650"></canvas>

<!--<a href="final.zip">SOURCE CODE</a>
<a href="thewayhome_rapport.pdf">RAPPORT</a>-->

<script src="js/final.js?r=<?php echo rand(0, 999999);?>"></script>
</body>
</html>
