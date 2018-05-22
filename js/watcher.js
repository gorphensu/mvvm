function Watcher (vm, expOrFn, cb) {
	this.cb = cb
	this.vm = vm
	this.expOrFn = expOrFn
	this.depIds = {}

	if (typeof expOrFn === 'function') {
		this.getter = expOrFn
	} else {
		this.getter = this.parseGetter(expOrFn)
	}

	this.value = this.get()
}

Watcher.prototype = {
	update: function () {
		this.run()
	},
	run: function () {
		var value = this.get()
		var oldVal = this.value
		if (value !== oldVal) {
			this.value = value
			this.cb.call(this.vm, value, oldVal)
		}
	},
	// 1. 每次调用run的时候会触发相应属性的getter
	// getter里面会触发dep.depend(),继而触发这里的addDep
	// 
	// 2. 假如相应属性的dep.id已经在当前depids里面，说明不是一个新的属性，仅仅改变了其值而已
	// 则不需要继续添加该属性
	// 
	// 3. 假如是新属性，添加进dep
	// 
	// 4. 每个子属性的watcher在添加到子属性的dep的同时，也会添加到父属性的dep
	// 监听子属性的同时监听父属性的变更，这样，父属性改变时，子属性也会受到通知
	// 这一步是在this.get() => this.getVMVal()里面完成。forEach时会从父级开始取值，间接调用了getter
	// 触发了addDep(),在整个foreach过程，当前watcher都会加入到每个父级过程属性的dep
	// 加入：child.child.name 那么child child.child child.child.name这三个属性的dep都会加入当前watcher
	addDep: function (dep) {
		if (!this.depIds.hasOwnProperty(dep.id)) {
			dep.addSub(this)
			this.depIds[dep.id] = dep
		}
	},
	get: function () {
		Dep.target = this
		var value = this.getter.call(this.vm, this.vm)
		Dep.target = null
		return value
	},
	parseGetter: function (exp) {
		if (/[^\w.$]/.test(exp)) return
		var exps = exp.split('.')

		return function (obj) {
			for (var i = 0, len = exps.length; i < len; i++) {
				if (!obj) return
				obj = obj[exps[i]]
			}
			return obj
		}
	}
}