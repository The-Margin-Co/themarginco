<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="robots" content="noindex"/>
        <title>Sitemap | The Margin Co</title>
        <style>
          *{box-sizing:border-box}
          body{margin:0;font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:#18181b;background:#fafafa}
          header{background:#09090b;color:#fff;padding:32px 24px}
          header div,main{max-width:1000px;margin:0 auto}
          h1{margin:0 0 6px;font-size:26px}
          h1 span{background:#facc15;color:#09090b;border-radius:6px;padding:0 8px;margin-right:10px}
          header p{margin:0;color:#a1a1aa}
          main{padding:24px}
          .note{margin:0 0 20px;color:#52525b}
          table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #e4e4e7;border-radius:10px;overflow:hidden}
          th,td{text-align:left;padding:10px 14px;border-bottom:1px solid #f0f0f2;vertical-align:top}
          th{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#71717a;background:#f4f4f5}
          tr:last-child td{border-bottom:0}
          td a{color:#18181b;text-decoration:none;word-break:break-all}
          td a:hover{text-decoration:underline}
          .tag{display:inline-block;font-size:12px;font-weight:600;padding:1px 8px;border-radius:99px;background:#fef9c3;color:#713f12}
          .muted{color:#71717a;white-space:nowrap}
          @media(max-width:640px){.hide{display:none}}
        </style>
      </head>
      <body>
        <header>
          <div>
            <h1><span>TMC</span>Sitemap</h1>
            <p><xsl:value-of select="count(sm:urlset/sm:url)"/> pages for search engines to crawl</p>
          </div>
        </header>
        <main>
          <p class="note">This is the XML sitemap for <strong>The Margin Co</strong>. Search engines read it to find every page; this table is only a friendly view of the same file.</p>
          <table>
            <thead>
              <tr>
                <th>Page</th>
                <th>Type</th>
                <th>Last updated</th>
                <th class="hide">Checked</th>
                <th class="hide">Priority</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sm:urlset/sm:url">
                <tr>
                  <td><a href="{sm:loc}"><xsl:value-of select="sm:loc"/></a></td>
                  <td>
                    <span class="tag">
                      <xsl:choose>
                        <xsl:when test="contains(sm:loc,'/blog/')">Blog post</xsl:when>
                        <xsl:when test="contains(sm:loc,'/case-studies/')">Case study</xsl:when>
                        <xsl:when test="contains(sm:loc,'/services/')">Service</xsl:when>
                        <xsl:otherwise>Page</xsl:otherwise>
                      </xsl:choose>
                    </span>
                  </td>
                  <td class="muted">
                    <xsl:choose>
                      <xsl:when test="sm:lastmod"><xsl:value-of select="substring(sm:lastmod,1,10)"/></xsl:when>
                      <xsl:otherwise>–</xsl:otherwise>
                    </xsl:choose>
                  </td>
                  <td class="muted hide"><xsl:value-of select="sm:changefreq"/></td>
                  <td class="muted hide"><xsl:value-of select="sm:priority"/></td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
