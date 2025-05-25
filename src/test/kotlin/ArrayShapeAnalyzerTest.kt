package org.example.QIPC

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue
import kotlin.test.assertFalse

class ArrayShapeAnalyzerTest {
    private val analyzer = ArrayShapeAnalyzer()

    @Test
    fun test1DIntArray() {
        val arr = intArrayOf(1, 2, 3)
        val shape = analyzer.analyzeShape(arr)
        assertNotNull(shape)
        assertEquals(listOf(3), shape!!.dimensions)
        assertEquals(3, shape.totalElements)
        assertEquals("IntArray", shape.elementType)
        assertFalse(shape.isJagged)
    }

    @Test
    fun test2DIntArray() {
        val arr = arrayOf(intArrayOf(1, 2), intArrayOf(3, 4))
        val shape = analyzer.analyzeShape(arr)
        assertNotNull(shape)
        assertEquals(listOf(2, 2), shape!!.dimensions)
        assertEquals(4, shape.totalElements)
        assertEquals("IntArray", shape.elementType)
        assertFalse(shape.isJagged)
    }

    @Test
    fun test3DIntArray() {
        val arr = arrayOf(
            arrayOf(intArrayOf(1, 2), intArrayOf(3, 4)),
            arrayOf(intArrayOf(5, 6), intArrayOf(7, 8))
        )
        val shape = analyzer.analyzeShape(arr)
        assertNotNull(shape)
        assertEquals(listOf(2, 2, 2), shape!!.dimensions)
        assertEquals(8, shape.totalElements)
        assertEquals("IntArray", shape.elementType)
        assertFalse(shape.isJagged)
    }

    @Test
    fun testJaggedArray() {
        val arr = arrayOf(intArrayOf(1, 2), intArrayOf(3))
        val shape = analyzer.analyzeShape(arr)
        assertNotNull(shape)
        assertEquals(listOf(2, 2), shape!!.dimensions) // Uses first subarray's length
        assertTrue(shape.isJagged)
    }

    @Test
    fun testMixedTypeArray() {
        val arr = arrayOf(1, "a", 3.0)
        val shape = analyzer.analyzeShape(arr)
        assertNotNull(shape)
        assertEquals(listOf(3), shape!!.dimensions)
        assertEquals("Integer", shape.elementType)
        assertFalse(shape.isJagged)
    }
}
