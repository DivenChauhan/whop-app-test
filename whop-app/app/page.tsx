import Link from 'next/link';

export default function Page() {
	return (
		<div className="min-h-screen bg-gray-a12 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-3xl mx-auto">
				<div className="text-center mb-12">
					<h1 className="text-8 font-bold text-gray-9 mb-4">
						Welcome to Pulse 📊
					</h1>
					<p className="text-4 text-gray-6 mb-8">
						Anonymous Feedback Platform for Creators
					</p>
					<Link
						href="/pulse/dashboard"
						className="inline-block px-8 py-4 bg-accent-9 text-white font-semibold rounded-lg hover:bg-accent-10 transition-colors text-lg"
					>
						Go to Dashboard →
					</Link>
				</div>

				<div className="text-center mb-12 mt-12">
					<h2 className="text-6 font-bold text-gray-9 mb-4">
						Whop App Setup
					</h2>
					<p className="text-4 text-gray-6">
						Follow these steps to complete your Whop application setup
					</p>
				</div>

				<div className="space-y-8">
					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-5 font-semibold text-gray-9 mb-4 flex items-center">
							<span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-accent-9 text-white mr-3">
								1
							</span>
							Create your Whop app
						</h2>
						<p className="text-gray-6 ml-11">
							Go to your{" "}
							<a
								href="https://whop.com/dashboard"
								target="_blank"
								rel="noopener noreferrer"
								className="text-accent-9 hover:text-accent-10 underline"
							>
								Whop Dashboard
							</a>{" "}
							and create a new app in the Developer section.
						</p>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-5 font-semibold text-gray-9 mb-4 flex items-center">
							<span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-accent-9 text-white mr-3">
								2
							</span>
							Set up environment variables
						</h2>
						<p className="text-gray-6 ml-11 mb-4">
							Copy the .env file from your dashboard and create a new .env file
							in your project root. This will contain all the necessary
							environment variables for your app.
						</p>
						{process.env.NODE_ENV === "development" && (
							<div className="text-gray-6 ml-11">
								<pre>
									<code>
										WHOP_API_KEY={process.env.WHOP_API_KEY?.slice(0, 5)}...
										<br />
										NEXT_PUBLIC_WHOP_AGENT_USER_ID=
										{process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID}
										<br />
										NEXT_PUBLIC_WHOP_APP_ID=
										{process.env.NEXT_PUBLIC_WHOP_APP_ID}
										<br />
										NEXT_PUBLIC_WHOP_COMPANY_ID=
										{process.env.NEXT_PUBLIC_WHOP_COMPANY_ID}
									</code>
								</pre>
							</div>
						)}
					</div>

					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-5 font-semibold text-gray-9 mb-4 flex items-center">
							<span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-accent-9 text-white mr-3">
								3
							</span>
							Install your app into your whop
						</h2>
						<p className="text-gray-6 ml-11">
							{process.env.NEXT_PUBLIC_WHOP_APP_ID ? (
								<a
									href={`https://whop.com/apps/${process.env.NEXT_PUBLIC_WHOP_APP_ID}/install`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-accent-9 hover:text-accent-10 underline"
								>
									Click here to install your app
								</a>
							) : (
								<span className="text-amber-600">
									Please set your environment variables to see the installation
									link
								</span>
							)}
						</p>
					</div>
				</div>

				<div className="mt-12 text-center text-2 text-gray-5">
					<p>
						Need help? Visit the{" "}
						<a
							href="https://dev.whop.com"
							target="_blank"
							rel="noopener noreferrer"
							className="text-accent-9 hover:text-accent-10 underline"
						>
							Whop Documentation
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
