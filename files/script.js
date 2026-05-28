const mouseDistance = 400
const emojiWaitTime = 500
const emojiFallDelay = 200
const emojiRotations = [90, -90]
const emojiSizes = [150, 200, 250, 300]
const totalEmojiVariants = 4

let isLoading = true
let lastMouseX = 0
let lastMouseY = 0
let lastEmojiTime = 0

function splitTextIntoSpans(selector) {
	let elements = document.querySelectorAll(selector)
	elements.forEach(element => {
		let text = element.innerText
		let splitText = text
			.split('')
			.map(function (char) {
				return `<span>${char === ' ' ? '&nbsp;&nbsp;' : char}</span>`
			})
			.join('')
		element.innerHTML = splitText
	})
}

splitTextIntoSpans('.header h1')

gsap.to('.preloader', {
	clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
	duration: 1.5,
	delay: 5,
	ease: 'power4.inOut',
})

gsap.to('.loader', {
	rotation: '+=180',
	duration: 1.5,
	delay: 1,
	repeat: 1,
	ease: 'power4.inOut',
	onComplete: () => {
		gsap.to('.loader', {
			scale: 0,
			duration: 2,
			ease: 'power4.inOut',
			onComplete: initializePageAnimations,
		})
	},
})

function initializePageAnimations() {
	isLoading = false

	const timeline = gsap.timeline()

	document.querySelectorAll('.header-row').forEach(row => {
		timeline.to(
			row.querySelectorAll('span'),
			{
				y: 0,
				duration: 1,
				ease: 'power4.out',
				stagger: {
					amount: 0.25,
					from: 'start',
				},
			},
			0,
		)
	})

	timeline
		.to(
			'.hero-img',
			{
				scale: 1,
				duration: 1.5,
				ease: 'power4.out',
			},
			0,
		)
		.to(
			'.hero-img',
			{
				rotation: 360,
				duration: 20,
				ease: 'none',
				repeat: -1,
			},
			0,
		)
}

function createEmoji(mouseX, mouseY) {
	const emoji = document.createElement('div')

	const size = emojiSizes[Math.floor(Math.random() * emojiSizes.length)]
	const emojiVariant = Math.floor(Math.random() * totalEmojiVariants) + 1

	emoji.className = 'emoji'
	emoji.style.width = `${size}px`
	emoji.style.height = `${size}px`
	emoji.style.backgroundImage = `url(./img/emoji-${emojiVariant}.png)`
	emoji.style.left = `${mouseX - size / 2}px`
	emoji.style.top = `${mouseY - size / 2}px`

	document.querySelector('.emojis').appendChild(emoji)

	const initialRotation =
		emojiRotations[Math.floor(Math.random() * emojiRotations.length)]
	const timeline = gsap.timeline()

	const currentTime = Date.now()
	const delayFromLast =
		Math.max(0, emojiFallDelay - (currentTime - lastEmojiTime)) / 1000

	gsap.set(emoji, {
		scale: 0,
		rotation: initialRotation,
	})

	timeline
		.to(emoji, {
			scale: 1,
			rotation: 0,
			duration: 0.5,
			ease: 'back.out(1.75)',
		})
		.to(emoji, {
			y: window.innerHeight + size,
			rotation: initialRotation,
			duration: 0.5,
			ease: 'power2.in',
			delay: emojiWaitTime / 1000 + delayFromLast,
			onComplete: () => emoji.remove(),
		})

	return currentTime
}

document.addEventListener('mousemove', e => {
	if (!isLoading) return

	const distance = Math.sqrt(
		Math.pow(e.clientX - lastMouseX, 2) + Math.pow(e.clientY - lastMouseY, 2),
	)

	if (distance > mouseDistance) {
		lastEmojiTime = createEmoji(e.clientX, e.clientY)
		lastMouseX = e.clientX
		lastMouseY = e.clientY
	}
})
