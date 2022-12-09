import * as events from 'aws-cdk-lib/aws-events';
import * as eventsTargets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';
import { CronHandlerDefinition } from '../handlers';
import { BaseFunction, BaseFunctionProps } from './base-function';

export interface ServiceCronFunctionProps
	extends BaseFunctionProps<CronHandlerDefinition> {}

export class ServiceCronFunction extends BaseFunction<CronHandlerDefinition> {
	readonly rule: events.Rule;

	constructor(scope: Construct, id: string, props: ServiceCronFunctionProps) {
		const { definition, defaults } = props;
		super(scope, id, {
			...props,
			defaults: {
				timeout: 60,
				...defaults,
			},
			environment: {
				DD_TAGS: `handler_type:cron,handler_name:${definition.name}`,
				...props.environment,
			},
		});

		/**
		 * Add the scheduled event for this cron job.
		 */
		this.rule = new events.Rule(this, `${definition.name}Rule`, {
			schedule: events.Schedule.expression(
				definition.schedule.expressionString,
			),
			targets: [new eventsTargets.LambdaFunction(this)],
		});
	}
}
