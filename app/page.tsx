import SignIn from "@/components/sign-in";
import SignUp from "@/components/sign-up";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/token";
import { ArrowRight, Group, Receipt, Wallet } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary">
      <header className="container mx-auto px-4 py-10">
        <nav className="flex justify-between items-center mb-16">
          <div className="text-2xl font-bold text-primary">Splitwise</div>
          <div className="space-x-4">
            <SignIn />
            <SignUp />
          </div>
        </nav>

        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="text-5xl font-bold text-foreground">
              Split expenses with friends and family
            </h1>
            <p className="text-xl text-gray-600">
              Keep track of shared expenses and balances with housemates, trips,
              groups, friends, and family.
            </p>
            <Button className="flex items-center gap-2 px-6 py-3">
              Get Started <ArrowRight size={20} />
            </Button>
          </div>
          <div className="flex-1">
            <Image
              src="https://placehold.co/600x400"
              alt="Expense tracking illustration"
              className="w-full h-auto rounded-lg shadow-xl"
              width={600}
              height={400}
              priority={true}
            />
          </div>
        </div>
      </header>

      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Split expenses effortlessly
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Group className="w-12 h-12 text-primary" />}
              title="Create Groups"
              description="Organize expenses by creating groups for roommates, trips, or events."
            />
            <FeatureCard
              icon={<Receipt className="w-12 h-12 text-primary" />}
              title="Track Expenses"
              description="Add expenses and split them equally or with custom amounts."
            />
            <FeatureCard
              icon={<Wallet className="w-12 h-12 text-primary" />}
              title="Settle Up"
              description="See who owes whom and settle debts with minimal transactions."
            />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard
              number="1"
              title="Create a Group"
              description="Start by creating a group and adding your friends."
            />
            <StepCard
              number="2"
              title="Add Expenses"
              description="Record shared expenses as they happen."
            />
            <StepCard
              number="3"
              title="Split Costs"
              description="Split expenses equally or with custom amounts."
            />
            <StepCard
              number="4"
              title="Settle Up"
              description="Settle debts with simplified payments."
            />
          </div>
        </div>
      </section>

      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to start splitting expenses?
          </h2>
          <p className="text-indigo-100 mb-8">
            Join thousands of people who trust us for splitting expenses.
          </p>
          <button className="px-8 py-4 bg-white text-primary rounded-lg hover:bg-indigo-50 font-semibold">
            Sign Up Now
          </button>
        </div>
      </section>

      <footer className="bg-foreground text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold mb-4">Splitwise</h3>
              <p className="text-sm">
                The easiest way to share expenses with friends and family.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            &copy; 2024 Splitwise. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg relative">
      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center absolute -top-4 left-6">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-foreground mt-4 mb-2">
        {title}
      </h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
