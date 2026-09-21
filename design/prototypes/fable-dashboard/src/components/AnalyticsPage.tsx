import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  MessageCircle,
  Globe,
  BarChart3,
  Camera,
} from 'lucide-react';
import { trafficData, topProjects, attributionChannels } from '../data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, KPICard, Separator } from './ui';

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Core Questions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Enquiries This Month"
          value="24"
          trend="vs 15 last month"
          trendDirection="up"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <KPICard
          title="Visitors This Month"
          value="1,248"
          trend="vs 1,058 last month"
          trendDirection="up"
          icon={<Users className="h-4 w-4" />}
        />
        <KPICard
          title="Top Action Channel"
          value="WhatsApp"
          subtitle="38% of all enquiries"
          icon={<MessageCircle className="h-4 w-4" />}
        />
        <KPICard
          title="Most Viewed Project"
          value="342"
          subtitle="Boring Road Kitchen"
          icon={<Eye className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Attribution Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Attribution Channels
            </CardTitle>
            <CardDescription>Where your enquiries originate from</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {attributionChannels.map((channel) => (
              <div key={channel.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{channel.name}</span>
                  <span className="font-mono text-sm font-bold">{channel.value}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${channel.value}%`,
                      backgroundColor: channel.color,
                    }}
                  />
                </div>
              </div>
            ))}

            <Separator className="my-4" />

            {/* Visual breakdown */}
            <div className="flex h-4 w-full rounded-full overflow-hidden">
              {attributionChannels.map((channel) => (
                <div
                  key={channel.name}
                  style={{ width: `${channel.value}%`, backgroundColor: channel.color }}
                  title={`${channel.name}: ${channel.value}%`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {attributionChannels.map((channel) => (
                <div key={channel.name} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: channel.color }}
                  />
                  <span className="text-[10px] text-muted-foreground">{channel.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Viewed Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Top Viewed Projects
            </CardTitle>
            <CardDescription>Most popular portfolio items and their conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProjects.map((project) => (
                <div
                  key={project.name}
                  className="flex items-center gap-4 rounded-lg border border-border p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-lg">
                    {project.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{project.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {project.views} views
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageCircle className="h-3 w-3" />
                        {project.leads} leads
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold">
                      {((project.leads / project.views) * 100).toFixed(1)}%
                    </span>
                    <p className="text-[10px] text-muted-foreground">conversion</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Trend (larger) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Monthly Traffic Breakdown
          </CardTitle>
          <CardDescription>Detailed visitor and enquiry count per month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Month
                  </th>
                  <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Visitors
                  </th>
                  <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Enquiries
                  </th>
                  <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Conversion
                  </th>
                  <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {trafficData.map((row, idx) => {
                  const prev = idx > 0 ? trafficData[idx - 1] : null;
                  const visitorChange = prev
                    ? ((row.visitors - prev.visitors) / prev.visitors) * 100
                    : 0;
                  const conversion = ((row.enquiries / row.visitors) * 100).toFixed(2);

                  return (
                    <tr key={row.month} className="hover:bg-muted/50">
                      <td className="py-3 text-sm font-medium">{row.month} 2026</td>
                      <td className="py-3 text-right font-mono text-sm">
                        {row.visitors.toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-mono text-sm">{row.enquiries}</td>
                      <td className="py-3 text-right font-mono text-sm">{conversion}%</td>
                      <td className="py-3 text-right">
                        {idx > 0 && (
                          <span
                            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                              visitorChange >= 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {visitorChange >= 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {Math.abs(visitorChange).toFixed(0)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}