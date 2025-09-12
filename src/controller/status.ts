import { Controller, Get, Post } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@midwayjs/swagger';

/**
 * 状态监控 - 演示根路径API
 * 直接从根路径开始，无前缀
 */
@ApiTags('状态监控')
@Controller('/')
export class Status {

  /**
   * GET /health/components/{componentId}/checks/{checkId}/results/{resultId} - 根路径健康检查
   */
  @ApiOperation({ 
    summary: '组件健康检查结果', 
    description: '根路径API：获取特定组件健康检查的详细结果' 
  })
  @ApiParam({ name: 'componentId', description: '组件ID', example: 'database-pool' })
  @ApiParam({ name: 'checkId', description: '检查ID', example: 'connection-test' })
  @ApiParam({ name: 'resultId', description: '结果ID', example: 'CHECK_20240115_001' })
  @ApiQuery({ 
    name: 'format', 
    required: false, 
    description: '返回格式',
    schema: { enum: ['json', 'xml', 'plain', 'prometheus'], type: 'string' },
    example: 'json' 
  })
  @ApiQuery({ 
    name: 'include_history', 
    required: false, 
    description: '包含历史检查结果',
    schema: { type: 'boolean' },
    example: false 
  })
  @ApiResponse({ status: 200, description: '健康检查结果获取成功' })
  @ApiResponse({ status: 404, description: '组件或检查结果不存在' })
  @Get('/health/components/:componentId/checks/:checkId/results/:resultId')
  async getComponentHealthResult(ctx: Context) {
    const { componentId, checkId, resultId } = ctx.params;
    const { format = 'json', include_history } = ctx.query;

    // 模拟健康检查结果
    const healthResult = {
      result_id: resultId,
      component: {
        id: componentId,
        name: componentId === 'database-pool' ? '数据库连接池' : '未知组件',
        type: 'database',
        version: '8.0.35',
        critical: true
      },
      check: {
        id: checkId,
        name: checkId === 'connection-test' ? '连接测试' : '未知检查',
        type: 'connectivity',
        interval_seconds: 30,
        timeout_seconds: 10
      },
      result: {
        status: 'healthy',
        executed_at: '2024-01-15T16:45:30Z',
        duration_ms: 45,
        success: true,
        message: '数据库连接池运行正常',
        details: {
          active_connections: 15,
          idle_connections: 35,
          max_connections: 100,
          connection_utilization: 0.15,
          average_response_time_ms: 12,
          failed_connections_last_hour: 0,
          longest_running_query_seconds: 2.5
        },
        metrics: {
          response_time_ms: 45,
          throughput_qps: 234,
          error_count: 0,
          memory_usage_mb: 128,
          cpu_usage_percent: 8
        }
      },
      thresholds: {
        response_time_warning_ms: 100,
        response_time_critical_ms: 500,
        connection_utilization_warning: 0.8,
        connection_utilization_critical: 0.95,
        error_rate_warning: 0.01,
        error_rate_critical: 0.05
      },
      historical_context: include_history === 'true' ? {
        last_24_hours: {
          total_checks: 2880,
          success_rate: 0.9986,
          average_response_time_ms: 42,
          incidents: 1
        },
        trends: {
          response_time_trend: 'stable',
          error_rate_trend: 'improving',
          availability_trend: 'stable'
        }
      } : null
    };

    // 根据格式返回不同的响应
    if (format === 'prometheus') {
      ctx.set('Content-Type', 'text/plain');
      ctx.body = `
# HELP component_health_status Component health check status (1=healthy, 0=unhealthy)
# TYPE component_health_status gauge
component_health_status{component="${componentId}",check="${checkId}"} ${healthResult.result.success ? 1 : 0}

# HELP component_response_time_ms Component health check response time in milliseconds
# TYPE component_response_time_ms gauge
component_response_time_ms{component="${componentId}",check="${checkId}"} ${healthResult.result.duration_ms}

# HELP component_connections_active Active database connections
# TYPE component_connections_active gauge
component_connections_active{component="${componentId}"} ${healthResult.result.details.active_connections}
      `.trim();
      return;
    }

    if (format === 'plain') {
      ctx.set('Content-Type', 'text/plain');
      ctx.body = `
Component: ${healthResult.component.name}
Check: ${healthResult.check.name}
Status: ${healthResult.result.status.toUpperCase()}
Response Time: ${healthResult.result.duration_ms}ms
Message: ${healthResult.result.message}
Active Connections: ${healthResult.result.details.active_connections}
Connection Utilization: ${(healthResult.result.details.connection_utilization * 100).toFixed(1)}%
      `.trim();
      return;
    }

    // 默认JSON格式
    ctx.body = {
      success: true,
      data: healthResult,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * POST /monitoring/incidents/{incidentId}/updates/{updateId} - 根路径事件更新
   */
  @ApiOperation({ 
    summary: '提交事件状态更新', 
    description: '根路径API：提交监控事件的状态更新信息' 
  })
  @ApiParam({ name: 'incidentId', description: '事件ID', example: 'INC_20240115_001' })
  @ApiParam({ name: 'updateId', description: '更新ID', example: 'UPDATE_001' })
  @ApiBody({
    description: '事件更新信息',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['investigating', 'identified', 'monitoring', 'resolved'],
          description: '事件状态',
          example: 'identified'
        },
        title: {
          type: 'string',
          description: '更新标题',
          maxLength: 200,
          example: '数据库连接问题已定位'
        },
        description: {
          type: 'string',
          description: '详细描述',
          maxLength: 2000,
          example: '经排查，数据库连接池配置存在问题，已进行调整并重启服务'
        },
        affected_components: {
          type: 'array',
          items: { type: 'string' },
          description: '受影响的组件',
          example: ['user-service', 'order-service', 'payment-service']
        },
        resolution_actions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              action: { type: 'string', description: '执行的操作' },
              completed_at: { type: 'string', format: 'date-time', description: '完成时间' },
              performed_by: { type: 'string', description: '执行人' },
              result: { type: 'string', description: '操作结果' }
            }
          },
          description: '解决措施',
          example: [
            {
              action: '重启数据库连接池',
              completed_at: '2024-01-15T16:30:00Z',
              performed_by: '运维工程师',
              result: '连接池恢复正常'
            }
          ]
        },
        metrics_snapshot: {
          type: 'object',
          properties: {
            error_rate: { type: 'number', description: '当前错误率' },
            response_time_p95: { type: 'number', description: '95%响应时间' },
            active_users: { type: 'number', description: '当前活跃用户数' },
            system_load: { type: 'number', description: '系统负载' }
          },
          description: '关键指标快照',
          example: {
            error_rate: 0.02,
            response_time_p95: 250,
            active_users: 1250,
            system_load: 0.65
          }
        },
        estimated_resolution: {
          type: 'string',
          format: 'date-time',
          description: '预计解决时间',
          example: '2024-01-15T17:00:00Z'
        },
        communication: {
          type: 'object',
          properties: {
            public_message: { type: 'string', description: '公开消息' },
            internal_notes: { type: 'string', description: '内部备注' },
            notify_stakeholders: { type: 'boolean', description: '通知相关方' },
            notification_channels: {
              type: 'array',
              items: { type: 'string' },
              description: '通知渠道'
            }
          },
          description: '沟通信息'
        },
        reporter: {
          type: 'string',
          description: '报告人',
          example: '运维团队'
        }
      },
      required: ['status', 'title', 'description', 'reporter']
    }
  })
  @ApiResponse({ status: 200, description: '事件更新提交成功' })
  @ApiResponse({ status: 400, description: '更新信息格式错误' })
  @Post('/monitoring/incidents/:incidentId/updates/:updateId')
  async submitIncidentUpdate(ctx: Context) {
    const { incidentId, updateId } = ctx.params;
    const body = ctx.request.body as any;
    const {
      status,
      title,
      description,
      affected_components = [],
      resolution_actions = [],
      metrics_snapshot = {},
      estimated_resolution,
      communication = {},
      reporter
    } = body;

    if (!status || !title || !description || !reporter) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '状态、标题、描述和报告人都是必填项',
        timestamp: new Date().toISOString()
      };
      return;
    }

    // 模拟事件更新处理
    const incidentUpdate = {
      update_id: updateId,
      incident_id: incidentId,
      sequence_number: 3, // 假设是第3次更新
      status: {
        previous: 'investigating',
        current: status,
        changed_at: new Date().toISOString()
      },
      content: {
        title,
        description,
        severity_change: null, // 严重程度是否变化
        scope_change: affected_components.length > 2 ? 'expanded' : 'unchanged'
      },
      impact_assessment: {
        affected_components,
        estimated_users_impacted: affected_components.length * 500,
        business_impact: status === 'resolved' ? 'minimal' : 'moderate',
        sla_breach_risk: status === 'resolved' ? 'none' : 'low'
      },
      resolution_progress: {
        actions_taken: resolution_actions,
        completion_percentage: status === 'resolved' ? 100 : 
                             status === 'monitoring' ? 80 :
                             status === 'identified' ? 50 : 25,
        next_steps: status === 'resolved' ? ['监控恢复情况'] : 
                   status === 'monitoring' ? ['持续观察指标'] :
                   ['执行修复措施'],
        estimated_resolution
      },
      metrics_and_monitoring: {
        current_metrics: metrics_snapshot,
        trend_analysis: {
          error_rate: 'improving',
          response_time: 'stable',
          user_experience: status === 'resolved' ? 'recovered' : 'degraded'
        },
        automated_checks: {
          all_systems_operational: status === 'resolved',
          critical_paths_verified: status === 'monitoring' || status === 'resolved'
        }
      },
      communication_tracking: {
        ...communication,
        auto_notifications_sent: communication.notify_stakeholders || false,
        external_status_page_updated: status === 'resolved' || status === 'identified',
        escalation_level: status === 'investigating' ? 'L2' : 'L1'
      },
      metadata: {
        reporter,
        reported_at: new Date().toISOString(),
        processed_by: 'incident_management_system',
        workflow_stage: status === 'resolved' ? 'post_mortem_pending' : 'active_resolution',
        tags: ['database', 'connection_pool', 'performance'],
        related_incidents: []
      }
    };

    ctx.body = {
      success: true,
      data: incidentUpdate,
      message: '事件状态更新已记录',
      timestamp: new Date().toISOString()
    };
  }
}
