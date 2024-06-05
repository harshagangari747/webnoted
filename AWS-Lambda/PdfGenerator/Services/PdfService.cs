using PdfSharp.Drawing;
using PdfSharp.Pdf;
using System.Diagnostics;
using System.Text.Json.Nodes;

namespace PdfGenerator.Services
{
    public class PdfService
    {
        private XFont heading, line;
        private XSolidBrush headingBrush, lineBrush;
        public PdfService()
        {
            heading = new XFont("Arial", 11, XFontStyleEx.Bold | XFontStyleEx.Underline);
            line = new XFont("Arial", 10, XFontStyleEx.Regular);
            headingBrush = XBrushes.DarkRed;
            lineBrush = XBrushes.Black;
        }
        public PdfDocument CreatePdf(JsonArray data)
        {
            PdfDocument newDoc = new PdfDocument();
            PdfPage newPage = newDoc.AddPage();
            XGraphics gfx = XGraphics.FromPdfPage(newPage);
            int x = 50, y = 50;
            foreach (JsonObject node in data)
            {
                if (node["command"].ToString() == "simpleLine")
                {
                    gfx.DrawString(node["text"].ToString(), line, lineBrush, new XRect(x, y, newPage.Width, 0),XStringFormats.BaseLineLeft);
                    y += heading.Height;
                }
                else if (node["command"].ToString() == "heading")
                {
                    gfx.DrawString(node["text"].ToString(), heading, headingBrush, new XRect(x, y, newPage.Width, 0),XStringFormats.BaseLineLeft);
                    y += line.Height;
                }

            }
            //string fileName = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
            //newDoc.Save(fileName);
            gfx.Save();
            //newDoc.Save(".//abc.pdf");
            return newDoc;
        }
    }
}
