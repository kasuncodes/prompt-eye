import {
  Users,
  Activity,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  Settings,
  UserPlus,
  Shield,
} from "lucide-react"

const stats = [
  {
    label: "Total Users",
    value: "1,234",
    trend: "+12.5%",
    trendUp: true,
    icon: Users,
    description: "vs last month",
  },
  {
    label: "Active Sessions",
    value: "567",
    trend: "+8.2%",
    trendUp: true,
    icon: Activity,
    description: "currently online",
  },
  {
    label: "API Calls",
    value: "12.4K",
    trend: "-2.1%",
    trendUp: false,
    icon: Zap,
    description: "last 24 hours",
  },
  {
    label: "Uptime",
    value: "99.9%",
    trend: "+0.1%",
    trendUp: true,
    icon: Clock,
    description: "last 30 days",
  },
]

const recentActivity = [
  {
    id: 1,
    icon: UserPlus,
    title: "New user registered",
    description: "john.doe@example.com joined the platform",
    time: "2 min ago",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: 2,
    icon: Eye,
    title: "Prompt analyzed",
    description: "Marketing campaign prompt scored 94/100",
    time: "5 min ago",
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    id: 3,
    icon: Settings,
    title: "Settings updated",
    description: "API rate limits increased to 1000/min",
    time: "12 min ago",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    id: 4,
    icon: Shield,
    title: "Security scan complete",
    description: "No vulnerabilities detected in prompts",
    time: "1 hour ago",
    iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
]

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your PromptEye analytics and activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </span>
                <span className="text-3xl font-bold tracking-tight">
                  {stat.value}
                </span>
                <div className="flex items-center gap-1.5 pt-1">
                  <span
                    className={`flex items-center gap-0.5 text-xs font-medium ${
                      stat.trendUp
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {stat.trendUp ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {stat.trend}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {stat.description}
                  </span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-2xl border bg-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Recent Activity
            </h2>
            <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              View all
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {recentActivity.map((activity, index) => (
              <div
                key={activity.id}
                className="group flex items-start gap-4 rounded-xl p-3 -mx-3 transition-colors hover:bg-muted/50"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${activity.iconBg}`}
                >
                  <activity.icon className="h-5 w-5" />
                </div>
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <span className="font-medium text-sm">{activity.title}</span>
                  <span className="text-sm text-muted-foreground truncate">
                    {activity.description}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats / System Health */}
        <div className="rounded-2xl border bg-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              System Health
            </h2>
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              All systems operational
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { label: "API Response Time", value: "45ms", percentage: 95 },
              { label: "Database Load", value: "23%", percentage: 23 },
              { label: "Memory Usage", value: "1.2GB", percentage: 48 },
              { label: "Storage", value: "234GB", percentage: 67 },
            ].map((metric) => (
              <div key={metric.label} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{metric.label}</span>
                  <span className="font-medium">{metric.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${metric.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
