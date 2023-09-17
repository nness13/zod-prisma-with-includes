import { z } from 'zod'
import _ from 'lodash'


export function with_includes(
	schemas: any,
	schemaObj: Record<any, any>,
	includes: Record<string, any>
) {
	const [name_schema] = obj_first_property(schemaObj)
	const data = get_related_shape(schemas, name_schema)
	let new_schema = data.core_shape

	// Run every relation dependency
	Object.entries(includes).forEach(([key, el]) => {
		if (!data.simple_related_zod_schema.hasOwnProperty(key)) return

		// If simple relation schema exists in schemas then we get name schema in database
		const [name_schema1] = obj_first_property(data.simple_related_zod_schema[key]?.shape)

		// console.log(key, typeof el)
		// If you only need to connect a dependency
		if (typeof el === 'boolean') {
			// console.log(data.simple_related_zod_schema, key, data.simple_related_zod_schema[key].array)
			new_schema[key] = data.simple_related_zod_schema[key].array
				? schemas[name_schema1].array()
				: schemas[name_schema1].optional()
		} else if (typeof el === 'object') {
			// If you need to connect dependencies within a dependency
			new_schema[key] = data.simple_related_zod_schema[key].array
				? with_includes(
					schemas,
					{ [name_schema1]: schemas[name_schema1] },
					includes[key].include
				).array()
				: with_includes(
					schemas,
					{ [name_schema1]: schemas[name_schema1] },
					includes[key].include
				).optional()
		}
	})
	return z.object(new_schema)
}

const obj_first_property = (obj: Record<any, any>) => {
	const obj_keys = Object.keys(obj)
	const name = obj_keys.length === 1 ? obj_keys[0] : null
	if (!name) throw new Error(`schemaObj must contain one property`)
	return [name, obj[name]]
}

const get_related_shape = (schemas: Record<any, any>, name_schema: string) => {
	const core_zod_schema = schemas[name_schema]
	const core_zod_shape = core_zod_schema._def.shape()
	const core_zod_schema_keys = Object.keys(core_zod_shape)
	const related_zod_schema = schemas[`Related${name_schema}`]
	const simple_related_zod_schema = schemas[`SimpleRelated${name_schema}`]
	const full_shape = related_zod_schema._def.getter()._def.shape()
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
