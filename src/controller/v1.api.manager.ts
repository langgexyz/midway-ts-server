import { Controller, Get, Post, Put, Del, Patch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@midwayjs/swagger';

/**
 * V1用户控制器 - 演示版本化API路径 /v1
 * 包含版本兼容性和向前兼容的API设计
 */
@ApiTags('V1版本API')
@Controller('/v1/users')
export class V1UserController {

  /**
   * GET /v1/users/{userId}/profiles/{profileType}/sections/{sectionId} - 版本化用户资料API
   */
  @ApiOperation({ 
    summary: '获取用户资料段落', 
    description: 'V1版本的用户资料段落API，支持多种资料类型' 
  })
  @ApiParam({ name: 'userId', description: '用户ID', example: '12345' })
  @ApiParam({ 
    name: 'profileType', 
    description: '资料类型',
    schema: { enum: ['basic', 'professional', 'social', 'financial'], type: 'string' },
    example: 'professional' 
  })
  @ApiParam({ 
    name: 'sectionId', 
    description: '段落ID',
    schema: { enum: ['education', 'experience', 'skills', 'certifications'], type: 'string' },
    example: 'experience' 
  })
  @ApiQuery({ 
    name: 'api_version', 
    required: false, 
    description: 'API版本号',
    schema: { enum: ['1.0', '1.1', '1.2'], type: 'string' },
    example: '1.2' 
  })
  @ApiQuery({ 
    name: 'fields', 
    required: false, 
    description: '返回字段(逗号分隔)',
    example: 'id,title,company,duration,skills' 
  })
  @ApiQuery({ 
    name: 'locale', 
    required: false, 
    description: '语言区域',
    schema: { enum: ['zh-CN', 'en-US', 'ja-JP'], type: 'string' },
    example: 'zh-CN' 
  })
  @ApiResponse({ status: 200, description: '用户资料段落获取成功' })
  @ApiResponse({ status: 404, description: '用户或资料段落不存在' })
  @Get('/:userId/profiles/:profileType/sections/:sectionId')
  async getUserProfileSection(ctx: Context) {
    const { userId, profileType, sectionId } = ctx.params;
    const { api_version = '1.2', fields, locale = 'zh-CN' } = ctx.query;

    // 模拟版本兼容处理
    const versionFeatures = {
      '1.0': { includeSkills: false, includeProjects: false },
      '1.1': { includeSkills: true, includeProjects: false },
      '1.2': { includeSkills: true, includeProjects: true }
    };

    const features = versionFeatures[api_version as string] || versionFeatures['1.2'];

    // 模拟资料数据
    let profileData = {
      id: sectionId,
      user_id: userId,
      profile_type: profileType,
      section_id: sectionId,
      content: {
        title: '高级软件工程师',
        company: '阿里巴巴集团',
        duration: '2022.03 - 至今',
        description: '负责微服务架构设计和实现，团队技术负责人',
        location: '杭州',
        achievements: [
          '设计并实现了高并发订单处理系统，QPS提升300%',
          '带领5人团队完成核心业务重构，代码质量显著提升'
        ]
      },
      metadata: {
        api_version,
        locale,
        last_updated: '2024-01-15T10:30:00Z',
        visibility: 'public'
      }
    };

    // 版本特性处理
    if (features.includeSkills) {
      profileData.content['skills'] = ['TypeScript', 'Node.js', 'React', 'Docker', 'Kubernetes'];
    }

    if (features.includeProjects) {
      profileData.content['related_projects'] = [
        { name: 'Gateway系统', role: '技术负责人', status: 'active' },
        { name: '用户中台', role: '核心开发', status: 'completed' }
      ];
    }

    // 字段筛选
    if (fields) {
      const selectedFields = (fields as string).split(',');
      const filteredContent = {};
      selectedFields.forEach(field => {
        if (profileData.content[field] !== undefined) {
          filteredContent[field] = profileData.content[field];
        }
      });
      profileData.content = filteredContent;
    }

    ctx.body = {
      success: true,
      data: profileData,
      api_info: {
        version: api_version,
        supported_versions: ['1.0', '1.1', '1.2'],
        deprecation_notice: api_version === '1.0' ? 'V1.0将在2024年6月废弃' : null
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * PUT /v1/notifications/{notificationId}/recipients/{recipientId}/preferences/{preferenceType} - 复杂通知偏好设置
   */
  @ApiOperation({ 
    summary: '更新通知偏好设置', 
    description: 'V1版本的通知偏好更新API，支持细粒度偏好控制' 
  })
  @ApiParam({ name: 'notificationId', description: '通知ID', example: 'NOTIF_001' })
  @ApiParam({ name: 'recipientId', description: '接收者ID', example: 'USER_12345' })
  @ApiParam({ 
    name: 'preferenceType', 
    description: '偏好类型',
    schema: { enum: ['email', 'sms', 'push', 'in_app'], type: 'string' },
    example: 'email' 
  })
  @ApiBody({
    description: '偏好设置更新',
    schema: {
      type: 'object',
      properties: {
        enabled: { 
          type: 'boolean', 
          description: '是否启用此类型通知', 
          example: true 
        },
        frequency: {
          type: 'string',
          enum: ['immediate', 'daily', 'weekly', 'monthly', 'never'],
          description: '通知频率',
          example: 'daily'
        },
        time_window: {
          type: 'object',
          properties: {
            start_time: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$', example: '09:00' },
            end_time: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$', example: '18:00' },
            timezone: { type: 'string', example: 'Asia/Shanghai' }
          },
          description: '接收时间窗口'
        },
        categories: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['security', 'marketing', 'system', 'social', 'billing']
          },
          description: '通知分类筛选',
          example: ['security', 'system']
        },
        priority_threshold: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'critical'],
          description: '最低优先级阈值',
          example: 'medium'
        }
      },
      required: ['enabled', 'frequency']
    }
  })
  @ApiResponse({ status: 200, description: '偏好设置更新成功' })
  @ApiResponse({ status: 400, description: '设置参数无效' })
  @Put('/:userId/notifications/:notificationId/recipients/:recipientId/preferences/:preferenceType')
  async updateNotificationPreference(ctx: Context) {
    const { notificationId, recipientId, preferenceType } = ctx.params;
    const body = ctx.request.body as any;
    const { enabled, frequency, time_window, categories, priority_threshold } = body;

    if (enabled === undefined || !frequency) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '启用状态和频率设置是必填项',
        timestamp: new Date().toISOString()
      };
      return;
    }

    // 模拟偏好设置更新
    const updatedPreference = {
      notification_id: notificationId,
      recipient_id: recipientId,
      preference_type: preferenceType,
      settings: {
        enabled,
        frequency,
        time_window: time_window || { 
          start_time: '09:00', 
          end_time: '18:00', 
          timezone: 'Asia/Shanghai' 
        },
        categories: categories || ['security', 'system'],
        priority_threshold: priority_threshold || 'medium'
      },
      validation: {
        conflicts: [],
        recommendations: frequency === 'immediate' ? 
          ['建议设置时间窗口以避免非工作时间打扰'] : [],
        effective_from: new Date().toISOString()
      },
      updated_at: new Date().toISOString()
    };

    ctx.body = {
      success: true,
      data: updatedPreference,
      message: '通知偏好设置更新成功',
      timestamp: new Date().toISOString()
    };
  }
}
