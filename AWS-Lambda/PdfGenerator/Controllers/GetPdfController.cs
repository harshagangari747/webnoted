using Microsoft.AspNetCore.Mvc;
using PdfGenerator.Services;
using PdfSharp.Pdf;
using System.Diagnostics;
using System.Text.Json.Nodes;

namespace PdfGenerator.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GetPdfController : Controller
    {
        private PdfService pdfServiceObj;
        [HttpPost]
        public IActionResult Index([FromBody] JsonObject userData)
        {
            HttpResponseMessage httpResponseMessage = new HttpResponseMessage();
            pdfServiceObj = new PdfService();
            try
            {
                PdfDocument document = pdfServiceObj.CreatePdf((JsonArray)userData["data"]);
                httpResponseMessage.StatusCode = System.Net.HttpStatusCode.OK;
                using (MemoryStream ms = new MemoryStream())
                {
                    document.Save(ms);
                    //  PrintPdf(document);
                    byte[] pdfBytes = ms.ToArray();
                    Console.WriteLine(pdfBytes);
                    httpResponseMessage.Content = new ByteArrayContent(pdfBytes);
                    httpResponseMessage.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
                    httpResponseMessage.Content.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("attachment")
                    {
                        FileName = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString()
                    };
                }
                return Ok(httpResponseMessage);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [NonAction]
        private void PrintPdf(PdfDocument document)
        {
            //try
            //{
            //    foreach(PdfPage page in document.Pages)
            //    {
            //        ContentReader cs = new ContentReader(page.Contents.GetStreamReader());
            //        string pageText = cs.GetTextFromString();

            //    }

            //}
            //catch (Exception e)
            //{

            //}
        }

    }
}
