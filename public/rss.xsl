<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/rss/channel">
    <html>
      <head>
        <title><xsl:value-of select="title"/></title>
        <style type="text/css">
          body { font-family: system-ui, sans-serif; background: #f9f9f9; color: #222; margin: 2em; }
          h1 { color: #0077cc; }
          .item { margin-bottom: 2em; padding-bottom: 1em; border-bottom: 1px solid #eee; }
          .pubDate { color: #888; font-size: 0.9em; }
          a { color: #0077cc; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1><xsl:value-of select="title"/></h1>
        <p><xsl:value-of select="description"/></p>
        <xsl:for-each select="item">
          <div class="item">
            <h2><a href="{link}"><xsl:value-of select="title"/></a></h2>
            <div class="pubDate"><xsl:value-of select="pubDate"/></div>
            <div><xsl:value-of select="description" disable-output-escaping="yes"/></div>
          </div>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
