import { CalendarDays, PieChart, Wallet } from "lucide-react"

const features = [
  {
    icon: Wallet,
    title: "All accounts, one number",
    description:
      "Checking, savings, cash, wallets — your total balance, always in view.",
  },
  {
    icon: PieChart,
    title: "Budgets that work",
    description:
      "Set limits that fit your life. See how you're doing before the month runs out.",
  },
  {
    icon: CalendarDays,
    title: "Bills on your radar",
    description:
      "Recurring charges and upcoming payments tracked automatically. No surprises.",
  },
]

export function LandingFeatures() {
  return (
    <section className="border-t bg-muted/30 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <h2
          className="text-center font-heading text-3xl tracking-tight"
          style={{ animation: "fadeUp 0.7s ease-out 300ms both" }}
        >
          Clarity for every corner of your finances
        </h2>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="rounded-xl border bg-card p-6 transition-shadow duration-300 hover:shadow-md"
              style={{
                animation: `fadeUp 0.7s ease-out ${400 + i * 100}ms both`,
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-medium">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
