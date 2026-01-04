import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { QAService } from './qa.service';

class AskQuestionDto {
  question: string;
}

@Controller('api/qa')
export class QAController {
  constructor(private readonly qaService: QAService) {}

  @Post('ask')
  async askQuestion(@Body() askQuestionDto: AskQuestionDto) {
    const { question } = askQuestionDto;

    if (!question || question.trim() === '') {
      return {
        error: 'Question is required',
      };
    }

    try {
      const result = await this.qaService.askQuestion(question);
      return {
        success: true,
        question,
        answer: result.answer,
        sources: result.sources,
      };
    } catch (error) {
      console.error('Error in askQuestion controller:', error);
      return {
        success: false,
        error: 'Failed to process question',
      };
    }
  }

  @Get('history')
  async getHistory(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    const history = await this.qaService.getHistory(limitNum);
    return {
      success: true,
      history,
    };
  }
}
