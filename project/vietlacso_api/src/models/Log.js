import DB from './Database'
const TABLE_NAME = 'logs'
const OBJ_DB = new DB()
const STATUS_ACTIVE = 1
const STATUS_INACTIVE = 0

class Log {
	constructor(obj) {
		this.ms = obj.milisecond
	}

	static getCondition(input) {
		let $where = 'WHERE'
		let check = 0 // điều kiện đầu tiên (check == 0)
		// thì ko cần dùng phép AND. Còn là điều kiện thứ N thì phải có AND
		const { from, to } = input || {}
		if (from) {
			$where = $where.concat(` ${check ? 'AND' : ''} created_at >= '${from}'`)
			check++
		}
		if (to) {
			$where = $where.concat(` ${check ? 'AND' : ''} created_at <= '${to}'`)
			check++
		}

		return {
			query: $where,
			hasWhere: check ? true : false, // kiem tra xem co dieu kien ko
		}
	}

	static async getAll() {
		let sql = `SELECT * FROM ${TABLE_NAME}`

		return OBJ_DB.query(sql)
	}

	static async paginate(input) {
		const filter = input || {}
		let { page, limit } = filter
		let start = 0
		page = parseInt(page, 10) || 1
		limit = parseInt(limit, 10) || 5
		if (page > 1) {
			start = (page - 1) * limit
		}
		const condition = this.getCondition(filter)
		let sql = `SELECT * FROM ${TABLE_NAME} ${
			condition.hasWhere ? condition.query : ''
		} ORDER BY id DESC LIMIT ? OFFSET ?`

		return OBJ_DB.query(sql, [limit, start])
	}

	static async getById(id) {
		let sql = `SELECT * FROM ${TABLE_NAME} WHERE id = ?`

		return OBJ_DB.query(sql, [id])
	}

	static async create(newObj) {
		let sql = `INSERT INTO ${TABLE_NAME} SET ?`

		return OBJ_DB.query(sql, newObj)
	}

	static async update(id, obj) {
		let sql = `UPDATE ${TABLE_NAME} SET ? WHERE id = ?`

		return OBJ_DB.query(sql, [obj, id])
	}

	static async remove(id) {
		let sql = `DELETE FROM ${TABLE_NAME} WHERE id = ?`

		return OBJ_DB.query(sql, [id])
	}

	static async count(input) {
		const condition = this.getCondition(input)
		let sql = `SELECT COUNT(*) AS count FROM ${TABLE_NAME} ${
			condition.hasWhere ? condition.query : ''
		}`

		return OBJ_DB.query(sql)
	}
}

export default Log
