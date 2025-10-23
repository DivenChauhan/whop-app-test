import { withWhopAppConfig } from "@whop/react/next.config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [{ hostname: "**" }],
	},
	async headers() {
		return [
			{
				// Apply these headers to all routes
				source: "/:path*",
				headers: [
					{
						key: "X-Frame-Options",
						value: "ALLOWALL",
					},
					{
						key: "Content-Security-Policy",
						value: "frame-ancestors 'self' https://*.whop.com https://whop.com",
					},
					{
						key: "Access-Control-Allow-Origin",
						value: "*",
					},
					{
						key: "Access-Control-Allow-Methods",
						value: "GET, POST, PUT, DELETE, OPTIONS",
					},
					{
						key: "Access-Control-Allow-Headers",
						value: "X-Requested-With, Content-Type, Authorization",
					},
				],
			},
		];
	},
};

export default withWhopAppConfig(nextConfig);
