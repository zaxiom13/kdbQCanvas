package org.example.QIPC

/**
 * Analyzes the shape and dimensions of arrays returned from KDB
 */
class ArrayShapeAnalyzer {
    
    data class ArrayShape(
        val dimensions: List<Int>,
        val totalElements: Int,
        val elementType: String,
        val isJagged: Boolean = false // For arrays with different lengths at some dimension
    )

    fun analyzeShape(array: Any?): ArrayShape? {
        if (array == null) return null

        fun getShape(arr: Any?): Pair<List<Int>, Boolean> {
            if (arr == null) return Pair(emptyList(), false)
            return when (arr) {
                is LongArray -> Pair(listOf(arr.size), false)
                is IntArray -> Pair(listOf(arr.size), false)
                is DoubleArray -> Pair(listOf(arr.size), false)
                is ShortArray -> Pair(listOf(arr.size), false)
                is BooleanArray -> Pair(listOf(arr.size), false)
                is CharArray -> Pair(listOf(arr.size), false)
                is Array<*> -> {
                    val size = arr.size
                    if (size == 0) return Pair(listOf(0), false)
                    val firstShape = getShape(arr[0])
                    var isJagged = false
                    for (i in 1 until size) {
                        val subShape = getShape(arr[i])
                        if (subShape.first != firstShape.first) {
                            isJagged = true
                        }
                    }
                    Pair(listOf(size) + firstShape.first, isJagged || firstShape.second)
                }
                else -> Pair(emptyList(), false)
            }
        }

        val (dimensions, isJagged) = getShape(array)
        val totalElements = dimensions.fold(1) { acc, d -> acc * d }
        val elementType = when (array) {
            is LongArray -> "LongArray"
            is IntArray -> "IntArray"
            is DoubleArray -> "DoubleArray"
            is ShortArray -> "ShortArray"
            is BooleanArray -> "BooleanArray"
            is CharArray -> "CharArray"
            is Array<*> -> {
                // Try to get the innermost type
                var current: Any? = array
                var type: String? = null
                while (current is Array<*> && current.isNotEmpty()) {
                    type = when (current[0]) {
                        is LongArray -> "LongArray"
                        is IntArray -> "IntArray"
                        is DoubleArray -> "DoubleArray"
                        is ShortArray -> "ShortArray"
                        is BooleanArray -> "BooleanArray"
                        is CharArray -> "CharArray"
                        is Array<*> -> "Array"
                        else -> current[0]?.javaClass?.simpleName
                    }
                    current = current[0]
                }
                type ?: "Object"
            }
            else -> array?.javaClass?.simpleName ?: "null"
        }
        return ArrayShape(
            dimensions = dimensions,
            totalElements = totalElements,
            elementType = elementType,
            isJagged = isJagged
        )
    }
}
