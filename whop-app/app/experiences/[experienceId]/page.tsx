import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	// The headers contains the user token
	const headersList = await headers();

	// The experienceId is a path param
	const { experienceId } = await params;

	// Try to verify user token, fall back to agent user for local dev
	let userId: string;
	try {
		const verified = await whopSdk.verifyUserToken(headersList);
		userId = verified.userId;
	} catch (error) {
		// In development, use the agent user ID when no auth token is present
		if (process.env.NODE_ENV === "development") {
			userId = process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID ?? "";
			console.log("⚠️  Using agent user ID for local testing:", userId);
		} else {
			throw error;
		}
	}

	const result = await whopSdk.access.checkIfUserHasAccessToExperience({
		userId,
		experienceId,
	});

	const user = await whopSdk.users.getUser({ userId });
	const experience = await whopSdk.experiences.getExperience({ experienceId });

	// Either: 'admin' | 'customer' | 'no_access';
	// 'admin' means the user is an admin of the whop, such as an owner or moderator
	// 'customer' means the user is a common member in this whop
	// 'no_access' means the user does not have access to the whop
	const { accessLevel } = result;

	return (
		<div className="flex justify-center items-center h-screen px-8">
			<h1 className="text-xl">
				Hi <strong>{user.name}</strong>, you{" "}
				<strong>{result.hasAccess ? "have" : "do not have"} access</strong> to
				this experience. Your access level to this whop is:{" "}
				<strong>{accessLevel}</strong>. <br />
				<br />
				Your user ID is <strong>{userId}</strong> and your username is{" "}
				<strong>@{user.username}</strong>.<br />
				<br />
				You are viewing the experience: <strong>{experience.name}</strong>
			</h1>
		</div>
	);
}
