import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string[];
  subject: string;
  html: string;
  type?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    encoding: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, type, attachments }: EmailRequest = await req.json();

    console.log('Sending email to:', to);
    console.log('Subject:', subject);
    console.log('Type:', type);
    console.log('Has attachments:', !!attachments && attachments.length > 0);
    console.log('RESEND_API_KEY exists:', !!Deno.env.get("RESEND_API_KEY"));

    if (!Deno.env.get("RESEND_API_KEY")) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const emailData: any = {
      from: "Hệ thống Tài sản <taisan@caremylife.me>", // Revert to original
      to: to,
      subject: subject,
      html: html,
    };

    if (attachments && attachments.length > 0) {
      emailData.attachments = attachments.map(att => ({
        filename: att.filename,
        content: att.content,
      }));
    }

    console.log("Email data being sent to Resend:", JSON.stringify(emailData, null, 2));

    const emailResponse = await resend.emails.send(emailData);

    console.log("Resend API response:", emailResponse);

    if (emailResponse.error) {
      console.error("Resend API error details:", emailResponse.error);
      throw new Error(`Resend API error: ${emailResponse.error.message}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: emailResponse,
      message: "Email sent successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in Edge Function handler:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.toString(),
        stack: error.stack // Include stack trace
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);