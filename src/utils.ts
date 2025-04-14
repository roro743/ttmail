/**
 * 生成随机字符串
 * @param length 字符串长度
 * @returns 随机字符串
 */
export function generateRandomString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  /**
   * 生成随机邮箱地址
   * @returns 随机邮箱地址
   */
  export function generateRandomAddress(): string {
    // 生成8-12位随机字符
    const length = Math.floor(Math.random() * 5) + 8;
    return generateRandomString(length);
  }
  
  /**
   * 生成唯一ID
   * @returns 唯一ID
   */
  export function generateId(): string {
    return crypto.randomUUID();
  }
  
  /**
   * 获取当前时间戳（秒）
   * @returns 当前时间戳
   */
  export function getCurrentTimestamp(): number {
    return Math.floor(Date.now() / 1000);
  }
  
  /**
   * 计算过期时间戳
   * @param hours 小时数
   * @returns 过期时间戳
   */
  export function calculateExpiryTimestamp(hours: number): number {
    return getCurrentTimestamp() + (hours * 60 * 60);
  }
  
  /**
   * 检查字符串是否为有效的邮箱地址格式
   * @param address 邮箱地址
   * @returns 是否有效
   */
  export function isValidEmailAddress(address: string): boolean {
    // 简单的邮箱格式验证
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(address);
  }
  
  /**
   * 提取邮箱地址的用户名部分
   * @param address 完整邮箱地址
   * @returns 用户名部分
   */
  export function extractMailboxName(address: string): string {
    return address.split('@')[0];
  }
  
  /**
   * 格式化日期时间
   * @param timestamp 时间戳（秒）
   * @returns 格式化的日期时间字符串
   */
  export function formatDateTime(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toISOString();
  }

  /**
   * 发送邮件
   * @param fromAddress 发件人地址
   * @param toAddress 收件人地址
   * @param toName 收件人名称
   * @param subject 邮件主题
   * @param textContent 纯文本内容
   * @param htmlContent HTML内容
   * @returns 发送结果
   */
  export async function sendEmail(
    fromAddress: string,
    toAddress: string,
    toName: string = '',
    subject: string,
    textContent: string = '',
    htmlContent: string = ''
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // 导入buildMimeEmail函数
      const { buildMimeEmail } = await import('./email-builder');
      
      // 构建MIME格式邮件
      const rawEmail = buildMimeEmail(
        fromAddress,
        toAddress,
        toName,
        subject,
        textContent,
        htmlContent
      );
      
      // 使用MailChannels API发送邮件
      const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: toAddress, name: toName || undefined }],
            },
          ],
          from: {
            email: fromAddress,
            name: extractMailboxName(fromAddress),
          },
          subject: subject,
          content: [
            {
              type: 'text/plain',
              value: textContent,
            },
            ...(htmlContent
              ? [
                  {
                    type: 'text/html',
                    value: htmlContent,
                  },
                ]
              : []),
          ],
          headers: {
            'X-Generated-By': 'TempMail-System',
            'X-Mime-Version': '1.0',
          },
          raw_mime: btoa(rawEmail),
        }),
      });

      if (response.ok) {
        return { success: true, message: '邮件发送成功' };
      } else {
        const errorData = await response.json() as { errors?: string[] };
        return {
          success: false,
          error: `邮件发送失败: ${errorData.errors?.[0] || response.statusText}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `邮件发送失败: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }