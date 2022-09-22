import { Inject, Injectable, Post } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';
import got from 'got';
import { Domain } from 'domain';
import * as FormData from 'form-data';
import { format } from 'path';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    // this.sendVerificationEmail('woowon','abcdefghijklmn');
    // this.sendEmail('test','ubereats',[])
  }

  async sendEmail(
    subject: string,
    template: string,
    emailVars: EmailVar[],
  ): Promise<boolean> {
    const form = new FormData();
    form.append(
      'from',
      `Won From SALAD PEACE <mailgun@${this.options.domain}>`,
    );
    form.append('to', `thewoowon@naver.com`);
    form.append('subject', subject);
    form.append('template', template);
    emailVars.forEach((eVar) => form.append(`v:${eVar.key}`, `${eVar.value}`));

    try {
      await got.post(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify Your Email', 'Salad Peace', [
      {
        key: 'username',
        value: email,
      },
      {
        key: 'code',
        value: code,
      },
    ]);
  }
}
