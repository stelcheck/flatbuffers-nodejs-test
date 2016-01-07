var flatbuffers = require('../lib/flatbuffers').flatbuffers;
var schema = require('../lib/schema_large_generated.js').MyGame;

var count = 200;

var len = 0;

var types = ['Weapon', 'Pickup'];

function generate() {
	var builder = new flatbuffers.Builder();

	var monsters = [];
	for (var i = 0; i < len; i += 1) {
		var name = builder.createString('Holtzinger');
		schema.Monster.startMonster(builder);
		schema.Monster.addPos(builder, schema.Vec3.createVec3(builder, 1, 2, 3))
		schema.Monster.addMana(builder, i);
		schema.Monster.addHp(builder, i);
		schema.Monster.addName(builder, name);
		schema.Monster.addColor(builder, 1);
		var pos = schema.Monster.endMonster(builder);
		monsters.push(pos);
	}

	var owns = schema.Monster.createOwnsVector(builder, monsters);
	var customs = [];

	for (var i = 1; i <= 100; i += 1) {
		var type = types[(i - 1) % 2];
		var typeSchema = schema[type];

		var name = builder.createString(type + i);
		typeSchema['start' + type](builder);
		typeSchema.addName(builder, name);
		typeSchema.addDamage(builder, i * 2);

		var pos = typeSchema['end' + type](builder);
		customs.push({
			type: type,
			pos: pos
		});
	}

	var name = builder.createString('Holtzinger');

	schema.Monster.startMonster(builder);
	schema.Monster.addPos(builder, schema.Vec3.createVec3(builder, 1, 2, 3))
	schema.Monster.addMana(builder, 250);
	schema.Monster.addHp(builder, 200);
	schema.Monster.addName(builder, name);
	schema.Monster.addColor(builder, 1);
	schema.Monster.addOwns(builder, owns);

	for (var i = 1; i <= customs.length; i += 1) {
		var info = customs[i - 1];

		schema.Monster['addCustom' + i + 'Type'](builder, schema.Any[info.type]);
		schema.Monster['addCustom' + i](builder, info.pos);
	}

	var pos = schema.Monster.endMonster(builder);
	schema.Monster.finishMonsterBuffer(builder, pos);

	return builder.asUint8Array();
}

for (len; len <= 100; len += 1) {
	var ba = generate();
	var serialized = new Buffer(ba);
	var size = serialized.length;

	var deserializeTime = Date.now();
	for (var i = 0; i < count; i += 1) {
		serialized = new Buffer(ba);
		ba = new Uint8Array(serialized);
		var bb = new flatbuffers.ByteBuffer(ba);
		var monster = schema.Monster.getRootAsMonster(bb);


		for (var custom = 1; custom <= 100; custom += 1) {
			var type = monster['custom' + custom + 'Type']()
			var typeName = types[type - 1];
			var customObject = new schema[typeName]();

			monster['custom' + custom](customObject)
		}
	}
	deserializeTime = Date.now() - deserializeTime;

	var serializeTime = Date.now();
	for (var i = 0; i < count; i += 1) {
		generate();
	}
	serializeTime = Date.now() - serializeTime;

	var mem =  process.memoryUsage();
	console.log([
		len,
		size,
		serializeTime,
		deserializeTime,
		mem.rss,
		mem.heapTotal,
		mem.heapUsed
	].join(','));
}
