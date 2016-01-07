var flatbuffers = require('../lib/flatbuffers').flatbuffers;
var schema = require('../lib/schema_generated.js').MyGame;

var count = 200;

var len = 0;

function generate() {
	var builder = new flatbuffers.Builder();
	var name = builder.createString('Holtzinger');

	var monsters = [];
	for (var i = 0; i < len; i += 1) {
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

	schema.Monster.startMonster(builder);
	schema.Monster.addPos(builder, schema.Vec3.createVec3(builder, 1, 2, 3))
	schema.Monster.addMana(builder, 250);
	schema.Monster.addHp(builder, 200);
	schema.Monster.addName(builder, name);
	schema.Monster.addColor(builder, 1);
	schema.Monster.addOwns(builder, owns);

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
