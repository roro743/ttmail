import { generateId } from './utils';

/**
 * 构建MIME格式的邮件
 * @param fromAddress 发件人地址
 * @param toAddress 收件人地址
 * @param toName 收件人名称
 * @param subject 邮件主题
 * @param textContent 纯文本内容
 * @param htmlContent HTML内容
 * @returns 原始MIME格式邮件
 */
export function buildMimeEmail(
  fromAddress: string,
  toAddress: string,
  toName: string = '',
  subject: string,
  textContent: string = '',
  htmlContent: string = ''
): string {
  // 生成邮件边界
  const boundary = `----=_Part_${Date.now().toString(16)}`;
  
  // 构建邮件头
  const headers = [
    `From: ${fromAddress}`,
    `To: ${toName ? `${toName} <${toAddress}>` : toAddress}`,
    `Subject: ${subject}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${generateId()}@${fromAddress.split('@')[1]}>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    ''
  ].join('\r\n');
  
  // 构建邮件内容
  let body = '';
  
  // 添加纯文本部分
  if (textContent) {
    body += [
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      textContent,
      ''
    ].join('\r\n');
  }
  
  // 添加HTML部分
  if (htmlContent) {
    body += [
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      htmlContent,
      ''
    ].join('\r\n');
  }
  
  // 添加结束边界
  body += `--${boundary}--\r\n`;
  
  // 完整的原始邮件
  return headers + body;
}

/**
 * 解析原始邮件内容
 * @param rawEmail 原始邮件内容
 * @returns 解析后的邮件对象
 */
export async function parseRawEmail(rawEmail: ArrayBuffer): Promise<any> {
  try {
    // 动态导入PostalMime
    const PostalMimeModule = await import('postal-mime');
    
    // 获取构造函数
    const PostalMimeConstructor = PostalMimeModule.default || PostalMimeModule;
    
    // 创建解析器实例
    const parser = new PostalMimeConstructor();
    
    // 解析邮件
    return await parser.parse(rawEmail);
  } catch (error) {
    console.error('PostalMime解析错误:', error);
    throw error; // 重新抛出错误，让调用者处理
  }
} 