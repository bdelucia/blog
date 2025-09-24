import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        // Require admin authentication
        await requireAdmin();

        // Check Google Analytics environment variables
        const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID;
        const GA_SERVICE_ACCOUNT_EMAIL = process.env.GA_SERVICE_ACCOUNT_EMAIL;
        const GA_PRIVATE_KEY = process.env.GA_PRIVATE_KEY;
        const NEXT_PUBLIC_GA_ID = process.env.NEXT_PUBLIC_GA_ID;

        const debugInfo = {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            gaConfig: {
                hasPropertyId: !!GA_PROPERTY_ID,
                propertyIdLength: GA_PROPERTY_ID?.length || 0,
                propertyIdPreview: GA_PROPERTY_ID
                    ? `${GA_PROPERTY_ID.substring(0, 4)}...`
                    : "undefined",

                hasServiceAccountEmail: !!GA_SERVICE_ACCOUNT_EMAIL,
                serviceAccountEmailLength:
                    GA_SERVICE_ACCOUNT_EMAIL?.length || 0,
                serviceAccountEmailPreview: GA_SERVICE_ACCOUNT_EMAIL
                    ? `${GA_SERVICE_ACCOUNT_EMAIL.substring(0, 10)}...`
                    : "undefined",

                hasPrivateKey: !!GA_PRIVATE_KEY,
                privateKeyLength: GA_PRIVATE_KEY?.length || 0,
                privateKeyStartsWith: GA_PRIVATE_KEY
                    ? GA_PRIVATE_KEY.substring(0, 20)
                    : "undefined",

                hasPublicGaId: !!NEXT_PUBLIC_GA_ID,
                publicGaIdLength: NEXT_PUBLIC_GA_ID?.length || 0,
                publicGaIdPreview: NEXT_PUBLIC_GA_ID
                    ? `${NEXT_PUBLIC_GA_ID.substring(0, 8)}...`
                    : "undefined",
            },
            allEnvVars: {
                // Only show GA-related env vars for security
                GA_PROPERTY_ID: GA_PROPERTY_ID ? "SET" : "NOT_SET",
                GA_SERVICE_ACCOUNT_EMAIL: GA_SERVICE_ACCOUNT_EMAIL
                    ? "SET"
                    : "NOT_SET",
                GA_PRIVATE_KEY: GA_PRIVATE_KEY ? "SET" : "NOT_SET",
                NEXT_PUBLIC_GA_ID: NEXT_PUBLIC_GA_ID ? "SET" : "NOT_SET",
            },
        };

        return NextResponse.json({
            success: true,
            debug: debugInfo,
        });
    } catch (error) {
        console.error("Error in GA debug endpoint:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch debug info",
            },
            { status: 500 }
        );
    }
}
