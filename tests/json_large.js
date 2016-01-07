var count = 10000;
var deserialized = {
	pos: {
		x: 1,
		y: 2,
		z: 3
	},
	mana: 150,
	hp: 100,
	name: "Holtzinger",
	color: 1
};

var child = JSON.stringify(deserialized);
deserialized.owns = [];

var types = ['Weapon', 'Pickup'];

for (var i = 0; i < 100; i += 1) {
	deserialized['custom' + (i + 1)] = {
		type: types[i % 2],
		damage: i * 2
	};
}

for (var len = 0; len <= 100; len += 1) {
	var serialized = JSON.stringify(deserialized);
	var size = new Buffer(serialized).length;

	var deserializeTime = Date.now();
	for (var i = 0; i < count; i += 1) {
		var buff = new Buffer(serialized);
		JSON.parse(serialized.toString());
	}
	deserializeTime = Date.now() - deserializeTime;

	var serializeTime = Date.now();
	for (var i = 0; i < count; i += 1) {
		JSON.stringify(deserialized);
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

	deserialized.owns.push(JSON.parse(child));
}
