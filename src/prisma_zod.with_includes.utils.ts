import z, { ZodLazy, ZodTypeAny } from 'zod'
import _ from 'lodash'

export function with_includes(
	schemas: any,
	schemaObj: Record<any, any>,
	includes: Record<string, any>
) {
	const [name_schema] = obj_first_property(schemaObj)
	const data = get_related_shape(schemas, name_schema)
	let new_schema = data.core_shape
	Object.entries(includes).forEach(([key, el]) => {
		if (!data.simple_related_zod_schema.hasOwnProperty(key)) return
		const [name_schema1] = obj_first_property(data.simple_related_zod_schema[key]?.shape)
		if (typeof el === 'boolean') {
			new_schema[key] = data.simple_related_zod_schema[key].array
				? schemas[name_schema1].array()
				: schemas[name_schema1]
		} else if (typeof el === 'object') {
			new_schema[key] = with_includes(
				schemas,
				{ [name_schema1]: schemas[name_schema1] },
				includes[key].include
			)
		}
	})
	return z.object(new_schema)
}

const obj_first_property = (obj: Record<any, any>) => {
	const obj_keys = Object.keys(obj)
	const name = obj_keys.length === 1 ? obj_keys[0] : null
	if (!name) throw new Error(`schemaObj не може бути пустим обєктом`)
	return [name, obj[name]]
}

const get_related_shape = (schemas: any, name_schema: any) => {
	const core_zod_schema = schemas[name_schema]
	type core_zod_shape_type = ReturnType<typeof core_zod_schema._def.shape>
	const core_zod_shape = core_zod_schema._def.shape() as core_zod_shape_type
	const core_zod_schema_keys = Object.keys(core_zod_shape)
	const related_zod_schema = schemas[`Related${name_schema}`] as ZodLazy<ZodTypeAny>
	const simple_related_zod_schema = schemas[`SimpleRelated${name_schema}`] as any
	const full_shape = related_zod_schema._def.getter()._def.shape() as Record<any, any>
	const core_shape = _.pick(full_shape, core_zod_schema_keys)
	const related_shape = _.omit(full_shape, core_zod_schema_keys)
	return {
		core_zod_schema,
		full_shape,
		core_shape,
		related_shape,
		simple_related_zod_schema,
	}
}
