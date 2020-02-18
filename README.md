# Flocking-Behaviour
Source : http://www.vergenet.net/~conrad/boids/pseudocode.html

## disque.js
Fichier javascript permettant de générer des disques pour l'historique du bruit 


# Branche disqueVisu
## disque.js
Fichier javascript permettant de générer des disques pour l'historique du bruit 

Prends en paramètres dans `constructor`  la position (x,y),(size) Taille du cercle interieur , (width) largeur du disque et (nbRing) nombre d'anneaux maximum affichable

### fonctions principales
`update(noises)`: est prévu pour être appelé tout les X frames, cela récupère la variable `float[]: noises `, on stock dans `bruitActuel` la somme des valeurs de noises qui est ensuite concatené dans `rings`. 

`render()` : Pour chaque valeur récupèrer grâce à `update(noises)` qui est stocké dans `rings`, on affiche des anneaux (du plus récent au plus ancient) représentant la somme total de bruit durant X frames , plus le cercle est opaque(noir) plus il y a eu de bruit 

## histogram.js
https://stackoverflow.com/questions/52598537/rotating-rectangles-around-circle-perimeter-on-canvas
https://stackoverflow.com/questions/22619441/javascript-canvas-rectangle-spin-around-circle
