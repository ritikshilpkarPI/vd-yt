import Joi from 'joi';
import { DownloadRequest } from '../types';

export const downloadRequestSchema = Joi.object<DownloadRequest>({
  url: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .pattern(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/)
    .required()
    .messages({
      'string.pattern.base': 'URL must be a valid YouTube URL',
      'string.uri': 'URL must be a valid URL',
      'any.required': 'URL is required',
    }),
  format: Joi.string()
    .valid('mp4', 'mp3')
    .optional()
    .default('mp4')
    .messages({
      'any.only': 'Format must be either mp4 or mp3',
    }),
});

export const validateDownloadRequest = (data: unknown): { error?: string; value?: DownloadRequest } => {
  const { error, value } = downloadRequestSchema.validate(data);
  
  if (error) {
    return { error: error.details[0].message };
  }
  
  return { value };
};
