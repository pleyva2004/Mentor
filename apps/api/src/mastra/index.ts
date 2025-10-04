import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';
import { agents } from './agents';
import { LibSQLStore } from '@mastra/libsql';
import { workflows } from './workflows';

export const mastra = new Mastra({
    agents: agents,
    workflows: workflows,
    storage: new LibSQLStore({
      url: ":memory:"
    }),
    logger: new PinoLogger({
      name: "mastra",
      level: "info",
    }),
    observability: {
      default: {
        enabled: true,
      }
    }
  })

