// var cluster = require('hierarchical-clustering');
var colors = [ [ 167, 162, 159, 157, 158, 160, 190, 'fire' ],
[ 145, 190, 194, 139, 138, 195, 196, 'death' ],
[ 189, 184, 179, 183, 180, 192, 182, 'earth' ],
[ 178, 170, 191, 196, 194, 193, 168, 'water' ],
[ 189, 184, 180, 183, 185, 195, 192, 'earth' ],
[ 167, 194, 192, 196, 158, 161, 195, 'fire' ],
[ 145, 196, 192, 141, 139, 195, 194, 'death' ],
[ 145, 190, 194, 139, 138, 195, 196, 'death' ],
[ 145, 190, 195, 193, 141, 194, 135, 'death' ],
[ 189, 184, 193, 195, 185, 194, 180, 'earth' ],
[ 167, 162, 158, 161, 163, 159, 157, 'fire' ],
[ 167, 162, 191, 158, 192, 161, 157, 'fire' ],
[ 167, 162, 157, 158, 159, 161, 163, 'fire' ],
[ 189, 184, 192, 179, 185, 183, 181, 'earth' ],
[ 156, 147, 193, 150, 194, 196, 149, 'life' ],
[ 145, 140, 136, 135, 190, 139, 194, 'death' ],
[ 156, 190, 146, 149, 150, 193, 194, 'life' ],
[ 145, 190, 138, 141, 194, 135, 140, 'death' ],
[ 167, 162, 192, 161, 160, 196, 157, 'fire' ],
[ 189, 184, 182, 179, 185, 181, 183, 'earth' ],
[ 167, 162, 196, 194, 158, 161, 159, 'fire' ],
[ 167, 162, 160, 158, 192, 161, 196, 'fire' ],
[ 145, 196, 192, 141, 195, 194, 139, 'death' ],
[ 189, 184, 180, 192, 183, 194, 195, 'earth' ],
[ 189, 190, 194, 183, 192, 185, 196, 'earth' ],
[ 167, 162, 158, 196, 161, 193, 194, 'fire' ],
[ 167, 162, 192, 160, 158, 194, 195, 'fire' ],
[ 167, 162, 194, 195, 161, 160, 157, 'fire' ],
[ 145, 140, 135, 141, 194, 192, 139, 'death' ],
[ 167, 162, 193, 192, 158, 194, 157, 'fire' ],
[ 189, 190, 185, 192, 179, 194, 180, 'earth' ],
[ 189, 180, 196, 192, 195, 185, 194, 'earth' ],
[ 145, 137, 191, 194, 141, 139, 196, 'death' ],
[ 167, 162, 191, 158, 161, 195, 157, 'fire' ] ]

const data = colors.map(x => x.slice(0,7))
console.log(data)
 
// // Euclidean distance
// function distance(a, b) {
//   var d = 0;
//   for (var i = 0; i < a.length; i++) {
//     d += Math.pow(a[i] - b[i], 2);
//   }
//   return Math.sqrt(d);
// }
 
// // Single-linkage clustering
// function linkage(distances) {
//   return Math.min.apply(null, distances);
// }
 
// var levels = cluster({
//   input: colors,
//   distance: distance,
//   linkage: linkage,
//   minClusters: 2, // only want two clusters
// });
 
// var clusters = levels[levels.length - 1].clusters;
// console.log(clusters);
// // => [ [ 2 ], [ 3, 1, 0 ] ]
// clusters = clusters.map(function (cluster) {
//   return cluster.map(function (index) {
//     return colors[index];
//   });
// });
// console.log(clusters);
// // => [ [ [ 250, 255, 253 ] ],
// // => [ [ 100, 54, 255 ], [ 22, 22, 90 ], [ 20, 20, 80 ] ] ]

var kmeans = require('dimas-kmeans')

var clusterskmeans = kmeans.getClusters(data);
console.log(clusterskmeans)
console.log(clusterskmeans.map(x=> x.data.length))
console.log(clusterskmeans[0].data)
console.log(clusterskmeans[1].data)