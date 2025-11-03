import React from 'react'
import { useAnalytics } from '../hooks/useApi'
import { Card } from '../components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts'
import { TrendingUp, Target, CheckCircle2, Clock } from 'lucide-react'

export function AnalyticsPage() {
  const { analytics, loading } = useAnalytics()

  // Show loading only if we have no analytics data at all
  const isInitialLoading = loading && !analytics

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <div className="text-gray-500 font-medium">Loading analytics...</div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No analytics data available</div>
      </div>
    )
  }

  const { subjectStats, weekData, overall } = analytics

  // Prepare pie chart data
  const pieChartData = subjectStats
    .filter((stat: any) => stat.total_tasks > 0)
    .map((stat: any) => ({
      name: stat.subject_name,
      value: stat.completed_tasks,
      color: stat.color_tag
    }))

  // Prepare completion rate data
  const completionRateData = subjectStats
    .filter((stat: any) => stat.total_tasks > 0)
    .map((stat: any) => ({
      name: stat.subject_name,
      rate: Math.round(stat.completion_rate),
      color: stat.color_tag
    }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Track your progress and productivity</p>
      </div>

      {/* Loading indicator for background updates */}
      {loading && analytics && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Updating...</span>
          </div>
        </div>
      )}

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Tasks</p>
              <p className="text-gray-900 mt-1">{overall.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Completed</p>
              <p className="text-gray-900 mt-1">{overall.completed}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">In Progress</p>
              <p className="text-gray-900 mt-1">{overall.inProgress}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Completion Rate</p>
              <p className="text-gray-900 mt-1">
                {overall.total > 0 ? Math.round((overall.completed / overall.total) * 100) : 0}%
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Rate by Subject */}
        <Card className="p-6">
          <h2 className="text-gray-900 mb-6">Completion Rate by Subject</h2>
          {completionRateData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No data available. Create subjects and tasks to see analytics.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={completionRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rate" name="Completion %" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Tasks Completed by Subject */}
        <Card className="p-6">
          <h2 className="text-gray-900 mb-6">Tasks Completed by Subject</h2>
          {pieChartData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No completed tasks yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Tasks Completed Over Time */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-gray-900 mb-6">Tasks Completed Over Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="completed" 
                name="Completed Tasks"
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Subject Details */}
      <Card className="p-6">
        <h2 className="text-gray-900 mb-6">Subject Details</h2>
        <div className="space-y-4">
          {subjectStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No subjects created yet
            </div>
          ) : (
            subjectStats.map((stat: any) => (
              <div key={stat.subject_id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: stat.color_tag }}
                />
                <div className="flex-1">
                  <h3 className="text-gray-900">{stat.subject_name}</h3>
                  <div className="flex items-center gap-4 text-gray-600 mt-1">
                    <span>{stat.total_tasks} tasks</span>
                    <span>{stat.completed_tasks} completed</span>
                    <span>{Math.round(stat.completion_rate)}% complete</span>
                  </div>
                </div>
                <div className="w-32">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all"
                      style={{ 
                        width: `${stat.completion_rate}%`,
                        backgroundColor: stat.color_tag
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
