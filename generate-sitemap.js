#!/usr/bin/env node
/**
 * Generates sitemap.xml from data.json
 * Usage: node generate-sitemap.js
 */
var fs = require('fs');
var path = require('path');

var dataPath = path.join(__dirname, 'data.json');
var sitemapPath = path.join(__dirname, 'sitemap.xml');
var baseUrl = 'https://www.jmaudio.fr';
var today = new Date().toISOString().split('T')[0];

var data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

var xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

// Homepage
xml += '  <url>\n';
xml += '    <loc>' + baseUrl + '/</loc>\n';
xml += '    <lastmod>' + today + '</lastmod>\n';
xml += '    <changefreq>weekly</changefreq>\n';
xml += '    <priority>1.0</priority>\n';
xml += '  </url>\n';

// Product pages
data.occasions.categories.forEach(function (cat, catIndex) {
  var isCompact = cat.compact;
  cat.products.forEach(function (prod, prodIndex) {
    xml += '  <!-- ' + prod.brand + ' ' + prod.model + ' -->\n';
    xml += '  <url>\n';
    xml += '    <loc>' + baseUrl + '/produit.html?cat=' + catIndex + '&amp;prod=' + prodIndex + '</loc>\n';
    xml += '    <lastmod>' + today + '</lastmod>\n';
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>' + (isCompact ? '0.6' : '0.8') + '</priority>\n';
    xml += '  </url>\n';
  });
});

xml += '</urlset>\n';

fs.writeFileSync(sitemapPath, xml);
console.log('Sitemap generated: ' + sitemapPath + ' (' + data.occasions.categories.reduce(function (sum, c) { return sum + c.products.length; }, 0) + ' products + homepage)');
